<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Car;
use Illuminate\Http\JsonResponse;

class LookupsController extends ApiController
{
    public function makes(): JsonResponse
    {
        $makes = Car::query()
            ->where('status', '!=', 'hidden')
            ->whereNotNull('make')
            ->distinct()
            ->orderBy('make')
            ->pluck('make')
            ->values();

        return response()->json(['data' => $makes]);
    }

    public function bodyTypes(): JsonResponse
    {
        $bodyTypes = Car::query()
            ->where('status', '!=', 'hidden')
            ->whereNotNull('body_type')
            ->distinct()
            ->orderBy('body_type')
            ->pluck('body_type')
            ->values();

        return response()->json(['data' => $bodyTypes]);
    }
}
