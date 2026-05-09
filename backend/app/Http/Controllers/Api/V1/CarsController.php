<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\CarResource;
use App\Models\Car;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarsController extends ApiController
{
    private const SORT_MAP = [
        'latest' => ['created_at', 'desc'],
        'price_asc' => ['price_jpy', 'asc'],
        'price_desc' => ['price_jpy', 'desc'],
        'year_desc' => ['year', 'desc'],
        'mileage_asc' => ['mileage_km', 'asc'],
    ];

    private const PER_PAGE_DEFAULT = 9;
    private const PER_PAGE_MAX = 50;

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', self::PER_PAGE_DEFAULT);
        $perPage = max(1, min(self::PER_PAGE_MAX, $perPage));

        $query = Car::query()
            ->with('images')
            ->where('status', '!=', 'hidden');

        $this->applyFilters($query, $request);
        $this->applySort($query, $request);

        $paginator = $query->paginate($perPage)->withQueryString();

        return $this->paginated($paginator, CarResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $car = Car::query()
            ->with('images')
            ->where('status', '!=', 'hidden')
            ->find($id);

        abort_if($car === null, 404, 'Car not found.');

        return $this->itemResponse(new CarResource($car));
    }

    /**
     * Up to 6 cars matching make OR body_type, excluding the current car,
     * ordered by closest production year (PRD §8.1).
     */
    public function similar(int $id): JsonResponse
    {
        $car = Car::query()->where('status', '!=', 'hidden')->find($id);

        abort_if($car === null, 404, 'Car not found.');

        $similar = Car::query()
            ->with('images')
            ->where('status', '!=', 'hidden')
            ->where('id', '!=', $car->id)
            ->where(function (Builder $q) use ($car): void {
                $q->where('make', $car->make)
                    ->orWhere('body_type', $car->body_type);
            })
            ->orderByRaw('ABS(year - ?) ASC', [$car->year])
            ->orderBy('id')
            ->limit(6)
            ->get();

        return $this->listResponse(CarResource::collection($similar));
    }

    private function applyFilters(Builder $query, Request $request): void
    {
        if ($q = trim((string) $request->input('q', ''))) {
            $like = '%'.$q.'%';
            $query->where(function (Builder $w) use ($like): void {
                $w->where('make', 'like', $like)
                    ->orWhere('model', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        foreach (['make', 'body_type', 'transmission', 'fuel'] as $field) {
            if ($value = $request->input($field)) {
                $query->where($field, $value);
            }
        }

        if ($yearFrom = $request->input('year_from')) {
            $query->where('year', '>=', (int) $yearFrom);
        }
        if ($yearTo = $request->input('year_to')) {
            $query->where('year', '<=', (int) $yearTo);
        }

        if ($priceMin = $request->input('price_min')) {
            $query->where('price_jpy', '>=', (int) $priceMin);
        }
        if ($priceMax = $request->input('price_max')) {
            $query->where('price_jpy', '<=', (int) $priceMax);
        }

        $source = $request->input('source');
        if ($source && $source !== 'all') {
            $query->where('source', $source);
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }
    }

    private function applySort(Builder $query, Request $request): void
    {
        $sort = $request->input('sort', 'latest');
        [$column, $direction] = self::SORT_MAP[$sort] ?? self::SORT_MAP['latest'];

        $query->orderBy($column, $direction);
        $query->orderBy('id', 'desc');
    }
}
