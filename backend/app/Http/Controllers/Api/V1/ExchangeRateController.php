<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Exchange-rate proxy (PRD §6.4.4 / §8.7).
 *
 * Returns {data: {from, to, rate, fetched_at, stale}} sourced from the
 * cache-backed service. Falls back to the last-known value on upstream
 * failure with stale=true. Returns 503 only when both upstream and
 * last-known cache are empty.
 */
class ExchangeRateController extends ApiController
{
    public function __invoke(ExchangeRateService $service): JsonResponse
    {
        try {
            $payload = $service->getUsdJpy();
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => 'Exchange rate is currently unavailable. Please try again shortly.',
            ], 503);
        }

        return response()->json([
            'data' => [
                'from' => 'USD',
                'to' => 'JPY',
                'rate' => $payload['rate'],
                'fetched_at' => $payload['fetched_at'],
                'stale' => (bool) ($payload['stale'] ?? false),
            ],
        ]);
    }
}
