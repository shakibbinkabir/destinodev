<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * USD→JPY exchange-rate proxy with cache + stale fallback (PRD §6.4.4).
 *
 * Cache layout:
 *   - exchange_rate:usd:jpy            12 h TTL (fresh value)
 *   - exchange_rate:usd:jpy:last_known forever (stale fallback)
 *
 * Fresh-fetch path: returns ['rate', 'fetched_at', 'stale' => false].
 * Cache-hit path: returns the cached payload as-is.
 * Upstream failure path: returns last-known with ['stale' => true].
 * No last-known: throws — controller turns this into a 503.
 */
class ExchangeRateService
{
    public const CACHE_KEY = 'exchange_rate:usd:jpy';

    public const LAST_KNOWN_KEY = 'exchange_rate:usd:jpy:last_known';

    public const FRESH_TTL_SECONDS = 60 * 60 * 12;

    public const ENDPOINT_TEMPLATE = 'https://v6.exchangerate-api.com/v6/%s/pair/USD/JPY';

    public function getUsdJpy(): array
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_array($cached)) {
            return array_merge($cached, ['stale' => false]);
        }

        try {
            $payload = $this->fetchFresh();
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

        Cache::put(self::CACHE_KEY, $payload, self::FRESH_TTL_SECONDS);
        Cache::forever(self::LAST_KNOWN_KEY, $payload);

        return array_merge($payload, ['stale' => false]);
    }

    /**
     * @return array{rate: float, fetched_at: string}
     */
    protected function fetchFresh(): array
    {
        $key = (string) config('services.exchange_rate.key', '');
        if ($key === '' || str_starts_with($key, 'CHANGE_ME')) {
            throw new RuntimeException('EXCHANGE_RATE_API_KEY is not configured.');
        }

        $url = sprintf(self::ENDPOINT_TEMPLATE, $key);

        try {
            $response = Http::timeout(8)->get($url);
        } catch (ConnectionException $e) {
            throw new RuntimeException('exchange-rate connection failed: '.$e->getMessage(), previous: $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException('exchange-rate non-2xx response: '.$response->status());
        }

        $body = $response->json();
        $rate = $body['conversion_rate'] ?? null;
        if (! is_numeric($rate)) {
            throw new RuntimeException('exchange-rate response missing conversion_rate.');
        }

        return [
            'rate' => round((float) $rate, 4),
            'fetched_at' => Carbon::now()->toIso8601String(),
        ];
    }
}
