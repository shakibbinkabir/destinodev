<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServicesController extends ApiController
{
    public function index(): JsonResponse
    {
        $services = Service::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->listResponse(ServiceResource::collection($services));
    }
}
