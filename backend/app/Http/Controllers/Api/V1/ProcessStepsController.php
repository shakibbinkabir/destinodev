<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\ProcessStepResource;
use App\Models\ProcessStep;
use Illuminate\Http\JsonResponse;

class ProcessStepsController extends ApiController
{
    public function index(): JsonResponse
    {
        $steps = ProcessStep::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->listResponse(ProcessStepResource::collection($steps));
    }
}
