<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

/**
 * Stub endpoint. The live exchange-rate proxy with cache + stale fallback
 * is delivered in Stage 4 (PRD §6.4.4). Until then this returns 503 so the
 * route surface is complete.
 */
class ExchangeRateController extends ApiController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'message' => 'Exchange rate endpoint is not yet implemented. Scheduled for Stage 4 (PRD §6.4.4).',
        ], 503);
    }
}
