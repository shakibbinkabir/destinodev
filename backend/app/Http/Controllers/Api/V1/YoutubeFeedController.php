<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

/**
 * Stub endpoint. The live YouTube RSS proxy with cache + stale fallback
 * is delivered in Stage 4 (PRD §6.4.5).
 */
class YoutubeFeedController extends ApiController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'message' => 'YouTube feed endpoint is not yet implemented. Scheduled for Stage 4 (PRD §6.4.5).',
        ], 503);
    }
}
