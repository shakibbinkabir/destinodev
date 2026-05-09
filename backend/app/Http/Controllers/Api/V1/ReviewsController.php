<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Mail\PendingReviewNotification;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ReviewsController extends ApiController
{
    /**
     * Persist a public review as a pending Testimonial (PRD §8.5) and queue
     * the moderation notification to the configured admin recipient
     * (PRD §6.4.2). Approve/Reject from Filament unhides it.
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

        Mail::queue(new PendingReviewNotification($testimonial));

        return $this->itemResponse([
            'id' => $testimonial->id,
        ], 201);
    }
}
