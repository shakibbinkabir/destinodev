<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\DeliveredCarResource;
use App\Models\DeliveredCar;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveredCarsController extends ApiController
{
    private const PER_PAGE_DEFAULT = 12;
    private const PER_PAGE_MAX = 50;

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', self::PER_PAGE_DEFAULT);
        $perPage = max(1, min(self::PER_PAGE_MAX, $perPage));

        $query = DeliveredCar::query()->where('status', 'published');

        if ($country = $request->input('country')) {
            $query->where('destination_country', $country);
        }
        if ($year = $request->input('year')) {
            $query->where('year', (int) $year);
        }

        $query->orderBy('delivery_date', 'desc')->orderBy('id', 'desc');

        $paginator = $query->paginate($perPage)->withQueryString();

        $facets = [
            'countries' => DeliveredCar::query()
                ->where('status', 'published')
                ->whereNotNull('destination_country')
                ->distinct()
                ->orderBy('destination_country')
                ->pluck('destination_country')
                ->values(),
            'years' => DeliveredCar::query()
                ->where('status', 'published')
                ->whereNotNull('year')
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year')
                ->map(fn ($v) => (int) $v)
                ->values(),
        ];

        return $this->paginated(
            $paginator,
            DeliveredCarResource::class,
            ['facets' => $facets],
        );
    }
}
