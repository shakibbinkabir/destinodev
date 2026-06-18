<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\ShippingScheduleService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * RoRo shipping-schedule directory (live-scraped, cached).
 *
 * Returns {data: [{region, carriers: [{name, schedule_url, news_url}]}],
 * meta: {stale, fetched_at}} sourced from ShippingScheduleService. Falls back
 * to the last-known value on upstream failure with stale=true; returns 503
 * only when both upstream and the last-known cache are empty.
 *
 * NOTE — PRD DEVIATION (CLAUDE.md rule 1): the PRD (§6.4.6 / §8.8) specs the
 * Shipping page around an admin-uploaded PDF (GET /shipping-pdf). The client
 * later directed that the schedule be sourced live from the planetcars.jp
 * RoRo directory instead; this endpoint implements that. The PDF endpoint is
 * left in place and unaffected.
 */
class ShippingScheduleController extends ApiController
{
    public function __invoke(ShippingScheduleService $service): JsonResponse
    {
        try {
            $payload = $service->getSchedule();
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => 'Shipping schedule is currently unavailable. Please try again shortly.',
            ], 503);
        }

        return response()->json([
            'data' => $payload['regions'],
            'meta' => [
                'stale' => (bool) ($payload['stale'] ?? false),
                'fetched_at' => $payload['fetched_at'] ?? null,
            ],
        ]);
    }
}
