<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use SimpleXMLElement;

/**
 * YouTube channel-feed proxy with cache + stale fallback (PRD §6.4.5).
 *
 * Fetches the public RSS feed (no API quota required) for the configured
 * channel ID, parses video entries via SimpleXML in the
 * `http://www.w3.org/2005/Atom`, `http://search.yahoo.com/mrss/`, and
 * `http://www.youtube.com/xml/schemas/2015` namespaces, and returns up to
 * six entries shaped for the public API.
 *
 * Cache layout:
 *   - youtube_feed:{channel}             1 h TTL (fresh value)
 *   - youtube_feed:{channel}:last_known  forever (stale fallback)
 */
class YouTubeFeedService
{
    public const FRESH_TTL_SECONDS = 60 * 60;

    public const FEED_URL_TEMPLATE = 'https://www.youtube.com/feeds/videos.xml?channel_id=%s';

    public const MAX_VIDEOS = 6;

    public function getChannelVideos(?string $channelId = null): array
    {
        $channelId = $channelId ?: (string) config('services.youtube.channel_id');
        if ($channelId === '') {
            throw new RuntimeException('YOUTUBE_CHANNEL_ID is not configured.');
        }

        $cacheKey = "youtube_feed:{$channelId}";
        $lastKnownKey = $cacheKey.':last_known';

        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return ['videos' => $cached, 'stale' => false];
        }

        try {
            $videos = $this->fetchFresh($channelId);
        } catch (RuntimeException $e) {
            Log::warning('youtube-feed upstream failed, falling back to last_known', [
                'channel' => $channelId,
                'reason' => $e->getMessage(),
            ]);

            $lastKnown = Cache::get($lastKnownKey);
            if (! is_array($lastKnown)) {
                throw new RuntimeException(
                    'YouTube feed unavailable: upstream failed and no cached value exists.',
                    previous: $e,
                );
            }

            return ['videos' => $lastKnown, 'stale' => true];
        }

        Cache::put($cacheKey, $videos, self::FRESH_TTL_SECONDS);
        Cache::forever($lastKnownKey, $videos);

        return ['videos' => $videos, 'stale' => false];
    }

    /**
     * @return array<int, array{videoId: string, title: string, published: ?string, thumbnail: ?string, views: ?int}>
     */
    protected function fetchFresh(string $channelId): array
    {
        $url = sprintf(self::FEED_URL_TEMPLATE, $channelId);

        try {
            $response = Http::timeout(8)->get($url);
        } catch (ConnectionException $e) {
            throw new RuntimeException('youtube-feed connection failed: '.$e->getMessage(), previous: $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException('youtube-feed non-2xx response: '.$response->status());
        }

        return $this->parse($response->body());
    }

    /**
     * @return array<int, array{videoId: string, title: string, published: ?string, thumbnail: ?string, views: ?int}>
     */
    public function parse(string $xml): array
    {
        if (trim($xml) === '') {
            throw new RuntimeException('youtube-feed body is empty.');
        }

        libxml_use_internal_errors(true);
        $feed = simplexml_load_string($xml);
        if ($feed === false) {
            throw new RuntimeException('youtube-feed could not be parsed as XML.');
        }

        $namespaces = $feed->getNamespaces(true);
        $mediaNs = $namespaces['media'] ?? 'http://search.yahoo.com/mrss/';
        $ytNs = $namespaces['yt'] ?? 'http://www.youtube.com/xml/schemas/2015';

        $videos = [];
        foreach ($feed->entry ?? [] as $entry) {
            /** @var SimpleXMLElement $entry */
            $yt = $entry->children($ytNs);
            $media = $entry->children($mediaNs);

            $videoId = isset($yt->videoId) ? (string) $yt->videoId : null;
            if ($videoId === null || $videoId === '') {
                continue;
            }

            $title = (string) ($entry->title ?? '');
            $published = isset($entry->published) ? (string) $entry->published : null;

            $thumbnail = null;
            $views = null;

            $group = $media->group ?? null;
            if ($group instanceof SimpleXMLElement) {
                $thumbnail = $this->bestThumbnail($group, $mediaNs);

                $stats = $group->children($mediaNs)->community->statistics ?? null;
                if ($stats instanceof SimpleXMLElement) {
                    $attr = $stats->attributes();
                    if (isset($attr['views'])) {
                        $views = (int) $attr['views'];
                    }
                }
            }

            $thumbnail ??= "https://i.ytimg.com/vi/{$videoId}/hqdefault.jpg";

            $videos[] = [
                'videoId' => $videoId,
                'title' => $title,
                'published' => $published ? Carbon::parse($published)->toIso8601String() : null,
                'thumbnail' => $thumbnail,
                'views' => $views,
            ];

            if (count($videos) >= self::MAX_VIDEOS) {
                break;
            }
        }

        return $videos;
    }

    protected function bestThumbnail(SimpleXMLElement $group, string $mediaNs): ?string
    {
        $best = null;
        $bestWidth = 0;
        foreach ($group->children($mediaNs)->thumbnail ?? [] as $thumb) {
            $attr = $thumb->attributes();
            if (! isset($attr['url'])) {
                continue;
            }
            $width = isset($attr['width']) ? (int) $attr['width'] : 0;
            if ($width >= $bestWidth) {
                $bestWidth = $width;
                $best = (string) $attr['url'];
            }
        }

        return $best;
    }
}
