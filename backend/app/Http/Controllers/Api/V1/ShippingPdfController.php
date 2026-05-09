<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

/**
 * Stub endpoint. The shipping PDF redirect lookup against settings/page extras
 * is delivered in Stage 4 (PRD §6.4.6).
 */
class ShippingPdfController extends ApiController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'message' => 'Shipping PDF endpoint is not yet implemented. Scheduled for Stage 4 (PRD §6.4.6).',
        ], 503);
    }
}
