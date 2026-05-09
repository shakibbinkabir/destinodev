<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreInquiryRequest;
use App\Mail\CustomerInquiryConfirmation;
use App\Mail\NewInquiryNotification;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class InquiriesController extends ApiController
{
    /**
     * Persist a public inquiry and queue both the admin notification and the
     * customer confirmation. Both mailables implement ShouldQueue, so
     * Mail::queue() pushes them to the database driver and the scheduled
     * queue:work picks them up (PRD §6.4.1, §6.4.7).
     */
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        $inquiry = Inquiry::create(array_merge(
            $request->validated(),
            [
                'status' => 'new',
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
            ],
        ));

        Mail::queue(new NewInquiryNotification($inquiry));
        Mail::queue(new CustomerInquiryConfirmation($inquiry));

        return $this->itemResponse([
            'id' => $inquiry->id,
            'received_at' => $inquiry->created_at?->toIso8601String(),
        ], 201);
    }
}
