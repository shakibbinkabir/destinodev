<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreInquiryRequest;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;

class InquiriesController extends ApiController
{
    /**
     * Persist a public inquiry. Admin and customer email dispatch is wired in
     * Stage 4 (PRD §6.4.1) — this stage only writes the row and returns 201.
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

        return $this->itemResponse([
            'id' => $inquiry->id,
            'received_at' => $inquiry->created_at?->toIso8601String(),
        ], 201);
    }
}
