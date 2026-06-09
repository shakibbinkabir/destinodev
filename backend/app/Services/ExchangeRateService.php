<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * USD→JPY exchange-rate provider backed by MUFG Bank's published TT rates.
 *
 * The customer-facing JPY price is derived from the bank's USD cash-buy /
 * telegraphic-transfer-buying ("T.T.B.") rate, minus a fixed offset:
 *
 *     rate = USD T.T.B. - offset   (offset defaults to ¥4)
 *
 * Source page (Japanese, server-rendered HTML table):
 *   https://www.bk.mufg.jp/ippan/kinri/list_j/kinri/kawase.html
 *
 * The page marks unconfirmed rates with "----" (outside the bank's update
 * windows, e.g. nights/weekends USD can read "----" on every column). In that
 * case fetchFresh() throws and getUsdJpy() serves the last-known value with
 * stale=true, matching the original cache contract.
 *
 * NOTE — PRD DEVIATION (CLAUDE.md rule 1): PRD §6.4.4 specified
 * exchangerate-api.com with a 12 h cache. The client overrode this to the
 * MUFG scrape (T.T.B. − ¥4) refreshed every 3 hours. See backend/BLOCKERS.md.
 *
 * Cache layout (unchanged so consumers keep working):
 *   - exchange_rate:usd:jpy             3 h TTL (fresh value)
 *   - exchange_rate:usd:jpy:last_known  forever (stale fallback)
 *
 * Fresh-fetch path: returns ['rate', 'fetched_at', 'stale' => false].
 * Cache-hit path:    returns the cached payload as-is (stale => false).
 * Upstream failure:  returns last-known with ['stale' => true].
 * No last-known:     throws — controller turns this into a 503.
 */
class ExchangeRateService
{
    public const CACHE_KEY = 'exchange_rate:usd:jpy';

    public const LAST_KNOWN_KEY = 'exchange_rate:usd:jpy:last_known';

    public const FRESH_TTL_SECONDS = 60 * 60 * 3;

    /**
     * MUFG occasionally serves a 403/empty body to unknown clients; a desktop
     * UA keeps the public page reachable without scraping anything gated.
     */
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

    public function getUsdJpy(): array
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_array($cached)) {
            return array_merge($cached, ['stale' => false]);
        }

        try {
            return $this->refresh();
        } catch (RuntimeException $e) {
            Log::warning('exchange-rate upstream failed, falling back to last_known', [
                'reason' => $e->getMessage(),
            ]);

            $lastKnown = Cache::get(self::LAST_KNOWN_KEY);
            if (! is_array($lastKnown)) {
                throw new RuntimeException(
                    'Exchange rate unavailable: upstream failed and no cached value exists.',
                    previous: $e,
                );
            }

            return array_merge($lastKnown, ['stale' => true]);
        }
    }

    /**
     * Force a fresh fetch and repopulate both cache keys. Used by the
     * `exchange-rate:sync` scheduled command. Throws on upstream failure so
     * the caller can decide whether to keep the last-known value.
     *
     * @return array{rate: float, fetched_at: string, stale: bool}
     */
    public function refresh(): array
    {
        $payload = $this->fetchFresh();

        Cache::put(self::CACHE_KEY, $payload, self::FRESH_TTL_SECONDS);
        Cache::forever(self::LAST_KNOWN_KEY, $payload);

        return array_merge($payload, ['stale' => false]);
    }

    /**
     * @return array{rate: float, fetched_at: string}
     */
    protected function fetchFresh(): array
    {
        $url = (string) config('services.exchange_rate.mufg_url', '');
        if ($url === '') {
            throw new RuntimeException('EXCHANGE_RATE_MUFG_URL is not configured.');
        }

        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
                ->timeout(8)
                ->get($url);
        } catch (ConnectionException $e) {
            throw new RuntimeException('exchange-rate connection failed: '.$e->getMessage(), previous: $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException('exchange-rate non-2xx response: '.$response->status());
        }

        $ttb = $this->parse($response->body());
        $offset = (float) config('services.exchange_rate.ttb_offset', 4);

        $rate = round($ttb - $offset, 2);
        if ($rate <= 0) {
            throw new RuntimeException("exchange-rate derived a non-positive rate (TTB={$ttb}, offset={$offset}).");
        }

        return [
            'rate' => $rate,
            'fetched_at' => Carbon::now()->toIso8601String(),
        ];
    }

    /**
     * Extract the USD T.T.B. rate (4th rate column) from the MUFG page HTML.
     *
     * Column order per row: T.T.S., ACC., CASH S., T.T.B., A/S, D/P・D/A, CASH B.
     * Cells may be a number or a placeholder ("----" unconfirmed, "****"/"*"
     * not handled), so we read positionally rather than by "Nth number" —
     * dash-padded rows (e.g. QAR) would otherwise misalign the column.
     *
     * Throws when the USD row is missing or its T.T.B. cell is unconfirmed.
     */
    public function parse(string $html): float
    {
        if (trim($html) === '') {
            throw new RuntimeException('exchange-rate: MUFG page body is empty.');
        }

        // Flatten markup to text. Replace every tag with a space (NOT strip_tags,
        // which would glue adjacent cells: "<td>161.32</td><td>161.73</td>" must
        // not become "161.32161.73"). Then decode entities and collapse runs of
        // whitespace, including the &nbsp; (U+00A0) MUFG pads cells with.
        $text = (string) preg_replace('/<[^>]+>/', ' ', $html);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5);
        $text = (string) preg_replace('/[\s\x{00A0}]+/u', ' ', $text);

        // The USD row runs from the "USD" code to the next 3-letter currency
        // code (GBP). `u` for the Japanese label, `s` so `.` spans the cells.
        if (! preg_match('/USD\b(.*?)(?=[A-Z]{3}\b|$)/su', $text, $m)) {
            throw new RuntimeException('exchange-rate: USD row not found in MUFG page.');
        }

        // Cells in column order: a number (optional thousands separators) or a
        // dash/asterisk placeholder.
        preg_match_all('/(\d[\d,]*\.\d+)|(-{2,})|(\*{1,4})/u', $m[1], $cells, PREG_SET_ORDER);

        // Index 3 == 4th column == T.T.B.
        $ttbCell = $cells[3][1] ?? '';
        if ($ttbCell === '') {
            throw new RuntimeException('exchange-rate: USD T.T.B. is unconfirmed (----) or missing.');
        }

        $ttb = (float) str_replace(',', '', $ttbCell);
        if ($ttb <= 0) {
            throw new RuntimeException('exchange-rate: USD T.T.B. parsed as non-positive.');
        }

        return $ttb;
    }
}
