<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialsController extends ApiController
{
    private const HARD_CAP = 50;

    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::query()->where('status', 'approved');

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        $rows = $query
            ->orderByDesc('featured')
            ->orderByDesc('created_at')
            ->limit(self::HARD_CAP)
            ->get();

        return $this->listResponse(TestimonialResource::collection($rows));
    }
}
