<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\HeroSlideResource;
use App\Models\HeroSlide;
use Illuminate\Http\JsonResponse;

class HeroSlidesController extends ApiController
{
    public function index(): JsonResponse
    {
        $slides = HeroSlide::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->listResponse(HeroSlideResource::collection($slides));
    }
}
