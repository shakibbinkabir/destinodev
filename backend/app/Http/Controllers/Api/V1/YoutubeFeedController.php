<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\YouTubeFeedService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * YouTube channel-feed proxy (PRD §6.4.5 / §8.7).
 *
 * Returns up to 6 most recent videos with videoId / title / published /
 * thumbnail / views. Cache and stale-fallback live in the service layer.
 */
class YoutubeFeedController extends ApiController
{
    public function __invoke(YouTubeFeedService $service): JsonResponse
    {
        try {
            $payload = $service->getChannelVideos();
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => 'YouTube feed is currently unavailable. Please try again shortly.',
            ], 503);
        }

        return response()->json([
            'data' => $payload['videos'],
            'meta' => [
                'stale' => (bool) ($payload['stale'] ?? false),
            ],
        ]);
    }
}
