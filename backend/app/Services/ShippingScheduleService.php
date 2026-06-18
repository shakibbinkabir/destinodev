<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * RoRo shipping-schedule directory scraper with cache + stale fallback.
 *
 * Source is a third-party static HTML page (configured via
 * services.shipping_schedule.source_url). The relevant content is a single
 * table whose rows are grouped by destination region using a rowspan cell:
 *
 *   <tr><td rowspan="5"><h5>ASIA</h5></td>
 *       <td>TOYOFUJI</td>
 *       <td><a href="...">SCHEDULE</a></td>
 *       <td><a href="...">NEWS</a></td></tr>
 *   <tr><td>EASTERN CAR LINER</td><td><a href="...">SCHEDULE</a></td><td>&nbsp;</td></tr>
 *   ...
 *
 * The first row of each region carries the region heading cell; subsequent
 * rows omit it. We walk <tbody> rows, track the current region, and emit a
 * region-grouped structure shaped for the public API.
 *
 * Cache layout (mirrors ExchangeRateService / YouTubeFeedService):
 *   - shipping_schedule:roro             12 h TTL (fresh value)
 *   - shipping_schedule:roro:last_known  forever (stale fallback)
 *
 * Cache-hit path:   returns the cached payload with stale=false.
 * Fresh-fetch path: returns parsed regions with stale=false.
 * Upstream failure: returns last-known with stale=true.
 * No last-known:    throws — the controller turns this into a 503.
 */
class ShippingScheduleService
{
    public const CACHE_KEY = 'shipping_schedule:roro';

    public const LAST_KNOWN_KEY = 'shipping_schedule:roro:last_known';

    public const FRESH_TTL_SECONDS = 60 * 60 * 12;

    /**
     * The source occasionally serves a 403/empty body to unknown clients; a
     * desktop UA keeps the public page reachable.
     */
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

    /**
     * @return array{regions: array<int, array{region: string, carriers: array<int, array{name: string, schedule_url: ?string, news_url: ?string}>}>, fetched_at: string, stale: bool}
     */
    public function getSchedule(): array
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_array($cached)) {
            return array_merge($cached, ['stale' => false]);
        }

        try {
            return $this->refresh();
        } catch (RuntimeException $e) {
            Log::warning('shipping-schedule upstream failed, falling back to last_known', [
                'reason' => $e->getMessage(),
            ]);

            $lastKnown = Cache::get(self::LAST_KNOWN_KEY);
            if (! is_array($lastKnown)) {
                throw new RuntimeException(
                    'Shipping schedule unavailable: upstream failed and no cached value exists.',
                    previous: $e,
                );
            }

            return array_merge($lastKnown, ['stale' => true]);
        }
    }

    /**
     * Force a fresh fetch and repopulate both cache keys. Throws on upstream
     * failure so the caller can decide whether to keep the last-known value.
     *
     * @return array{regions: array, fetched_at: string, stale: bool}
     */
    public function refresh(): array
    {
        $payload = $this->fetchFresh();

        Cache::put(self::CACHE_KEY, $payload, self::FRESH_TTL_SECONDS);
        Cache::forever(self::LAST_KNOWN_KEY, $payload);

        return array_merge($payload, ['stale' => false]);
    }

    /**
     * @return array{regions: array, fetched_at: string}
     */
    protected function fetchFresh(): array
    {
        $url = (string) config('services.shipping_schedule.source_url', '');
        if ($url === '') {
            throw new RuntimeException('SHIPPING_SCHEDULE_URL is not configured.');
        }

        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
                ->timeout(12)
                ->get($url);
        } catch (ConnectionException $e) {
            throw new RuntimeException('shipping-schedule connection failed: '.$e->getMessage(), previous: $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException('shipping-schedule non-2xx response: '.$response->status());
        }

        $regions = $this->parse($response->body(), $url);
        if ($regions === []) {
            throw new RuntimeException('shipping-schedule: no schedule rows parsed from source HTML.');
        }

        return [
            'regions' => $regions,
            'fetched_at' => Carbon::now()->toIso8601String(),
        ];
    }

    /**
     * Parse the region-grouped carrier table out of the source HTML.
     *
     * @param  string  $baseUrl  used to resolve any relative carrier hrefs
     * @return array<int, array{region: string, carriers: array<int, array{name: string, schedule_url: ?string, news_url: ?string}>}>
     */
    public function parse(string $html, string $baseUrl = ''): array
    {
        if (trim($html) === '') {
            throw new RuntimeException('shipping-schedule: source HTML is empty.');
        }

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        // Force UTF-8 so multi-byte carrier names survive; the source has no
        // <meta charset> guarantee.
        $dom->loadHTML('<?xml encoding="UTF-8">'.$html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $table = $this->locateScheduleTable($xpath);
        if (! $table instanceof DOMElement) {
            throw new RuntimeException('shipping-schedule: schedule table not found in source HTML.');
        }

        $rows = $xpath->query('.//tbody/tr | .//tr', $table);
        if ($rows === false) {
            return [];
        }

        /** @var array<string, array<int, array{name: string, schedule_url: ?string, news_url: ?string}>> $byRegion */
        $byRegion = [];
        $order = [];
        $currentRegion = null;

        foreach ($rows as $row) {
            if (! $row instanceof DOMElement) {
                continue;
            }

            $cells = $this->directChildren($row, 'td');
            if ($cells === []) {
                continue; // header row (<th>) or spacer
            }

            $offset = 0;
            $regionHeading = $this->regionHeading($cells[0]);
            if ($regionHeading !== null) {
                $currentRegion = $regionHeading;
                $offset = 1; // carrier data starts in the next cell
            }

            if ($currentRegion === null) {
                continue;
            }

            $carrierCell = $cells[$offset] ?? null;
            if (! $carrierCell instanceof DOMElement) {
                continue;
            }

            $name = $this->normalizeWhitespace($carrierCell->textContent);
            if ($name === '') {
                continue;
            }

            $scheduleUrl = $this->firstHref($cells[$offset + 1] ?? null, $baseUrl);
            $newsUrl = $this->firstHref($cells[$offset + 2] ?? null, $baseUrl);

            if (! array_key_exists($currentRegion, $byRegion)) {
                $byRegion[$currentRegion] = [];
                $order[] = $currentRegion;
            }

            $byRegion[$currentRegion][] = [
                'name' => $name,
                'schedule_url' => $scheduleUrl,
                'news_url' => $newsUrl,
            ];
        }

        $regions = [];
        foreach ($order as $region) {
            $regions[] = [
                'region' => $region,
                'carriers' => $byRegion[$region],
            ];
        }

        return $regions;
    }

    /**
     * Pick the table that holds the schedule. Prefers the table containing the
     * most rows with a "SCHEDULE" anchor, so an unrelated layout table can't
     * win.
     */
    protected function locateScheduleTable(DOMXPath $xpath): ?DOMElement
    {
        $tables = $xpath->query('//table');
        if ($tables === false) {
            return null;
        }

        $best = null;
        $bestScore = 0;
        foreach ($tables as $table) {
            if (! $table instanceof DOMElement) {
                continue;
            }
            $scheduleLinks = $xpath->query(".//a[contains(translate(., 'schedule', 'SCHEDULE'), 'SCHEDULE')]", $table);
            $score = $scheduleLinks === false ? 0 : $scheduleLinks->length;
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $table;
            }
        }

        return $bestScore > 0 ? $best : null;
    }

    /**
     * Region heading text if this cell is a region label (contains an <h5>),
     * otherwise null.
     */
    protected function regionHeading(DOMElement $cell): ?string
    {
        foreach ($cell->getElementsByTagName('h5') as $h5) {
            $text = $this->normalizeWhitespace($h5->textContent);
            if ($text !== '') {
                return $text;
            }
        }

        return null;
    }

    /**
     * @return array<int, DOMElement>
     */
    protected function directChildren(DOMElement $parent, string $tag): array
    {
        $out = [];
        foreach ($parent->childNodes as $child) {
            if ($child instanceof DOMElement && strtolower($child->nodeName) === $tag) {
                $out[] = $child;
            }
        }

        return $out;
    }

    /**
     * First usable http(s) href inside a cell, resolved against $baseUrl when
     * relative. Returns null for empty cells, fragments, or javascript: links.
     */
    protected function firstHref(?DOMElement $cell, string $baseUrl): ?string
    {
        if (! $cell instanceof DOMElement) {
            return null;
        }

        foreach ($cell->getElementsByTagName('a') as $anchor) {
            $href = trim($anchor->getAttribute('href'));
            if ($href === '' || str_starts_with($href, '#') || str_starts_with(strtolower($href), 'javascript:')) {
                continue;
            }

            if (preg_match('#^https?://#i', $href)) {
                return $href;
            }

            $resolved = $this->resolveUrl($baseUrl, $href);
            if ($resolved !== null) {
                return $resolved;
            }
        }

        return null;
    }

    /**
     * Minimal relative-URL resolver: handles absolute (//host), root-relative
     * (/path), and same-directory relative hrefs against the source base.
     */
    protected function resolveUrl(string $baseUrl, string $href): ?string
    {
        if ($baseUrl === '') {
            return null;
        }

        $parts = parse_url($baseUrl);
        if (! isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $origin = $parts['scheme'].'://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');

        if (str_starts_with($href, '//')) {
            return $parts['scheme'].':'.$href;
        }
        if (str_starts_with($href, '/')) {
            return $origin.$href;
        }

        $dir = isset($parts['path']) ? rtrim(dirname($parts['path']), '/') : '';

        return $origin.$dir.'/'.$href;
    }

    protected function normalizeWhitespace(string $value): string
    {
        $value = preg_replace('/\s+/u', ' ', $value) ?? $value;

        return trim($value);
    }
}
