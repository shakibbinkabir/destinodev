<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class ReviewsController extends ApiController
{
    /**
     * Persist a public review as a pending Testimonial (PRD §8.5). Admin
     * notification email and approval moderation are wired in Stage 4.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $testimonial = Testimonial::create(array_merge(
            $request->validated(),
            [
                'status' => 'pending',
                'featured' => false,
            ],
        ));

        return $this->itemResponse([
            'id' => $testimonial->id,
        ], 201);
    }
}
