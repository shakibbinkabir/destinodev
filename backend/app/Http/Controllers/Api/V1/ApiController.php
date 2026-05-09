<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Collection;

abstract class ApiController extends Controller
{
    /**
     * Wrap a paginator in the documented {data, meta.pagination} envelope.
     *
     * Strips Laravel's default `links` array because it is not in PRD §8.6's
     * pagination shape. Resource serialization runs against the paginator's
     * underlying collection so the rest of the framework still flows through
     * the API Resource layer.
     */
    protected function paginated(LengthAwarePaginator $paginator, string $resourceClass, array $extraMeta = []): JsonResponse
    {
        /** @var ResourceCollection $collection */
        $collection = $resourceClass::collection($paginator->getCollection());

        $meta = [
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];

        if ($extraMeta !== []) {
            $meta = array_merge($meta, $extraMeta);
        }

        return response()->json([
            'data' => $collection->toArray(request()),
            'meta' => $meta,
        ]);
    }

    /**
     * Wrap a single Eloquent model (or array) in {data: ...}. Pass a JsonResource
     * instance for shaped responses.
     */
    protected function itemResponse(JsonResource|array $payload, int $status = 200): JsonResponse
    {
        if ($payload instanceof JsonResource) {
            return $payload->response()->setStatusCode($status);
        }

        return response()->json(['data' => $payload], $status);
    }

    /**
     * Wrap a non-paginated collection in {data: [...]}.
     */
    protected function listResponse(Collection|ResourceCollection $collection, int $status = 200): JsonResponse
    {
        if ($collection instanceof ResourceCollection) {
            return $collection->response()->setStatusCode($status);
        }

        return response()->json(['data' => $collection->values()], $status);
    }
}
