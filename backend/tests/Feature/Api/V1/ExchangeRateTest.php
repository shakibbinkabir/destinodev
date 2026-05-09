<?php

use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    Config::set('services.exchange_rate.key', 'test-api-key');
});

it('fetches a fresh rate, caches it, and returns stale=false', function () {
    Http::fake([
        'v6.exchangerate-api.com/*' => Http::response([
            'result' => 'success',
            'conversion_rate' => 148.32,
        ], 200),
    ]);

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(200);
    $response->assertJsonPath('data.from', 'USD');
    $response->assertJsonPath('data.to', 'JPY');
    $response->assertJsonPath('data.rate', 148.32);
    $response->assertJsonPath('data.stale', false);

    expect(Cache::get(ExchangeRateService::CACHE_KEY))->toBeArray();
    expect(Cache::get(ExchangeRateService::LAST_KNOWN_KEY))->toBeArray();
});

it('serves the cached value on the second call without re-hitting upstream', function () {
    Http::fake([
        'v6.exchangerate-api.com/*' => Http::response([
            'conversion_rate' => 148.50,
        ], 200),
    ]);

    $this->getJson('/api/v1/exchange-rate')->assertStatus(200);
    $this->getJson('/api/v1/exchange-rate')->assertStatus(200)
        ->assertJsonPath('data.rate', 148.50)
        ->assertJsonPath('data.stale', false);

    Http::assertSentCount(1);
});

it('falls back to last_known with stale=true when upstream returns 5xx', function () {
    // Seed last-known directly.
    Cache::forever(ExchangeRateService::LAST_KNOWN_KEY, [
        'rate' => 147.10,
        'fetched_at' => '2026-05-08T03:00:00+00:00',
    ]);

    Http::fake([
        'v6.exchangerate-api.com/*' => Http::response('boom', 503),
    ]);

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(200);
    $response->assertJsonPath('data.rate', 147.10);
    $response->assertJsonPath('data.fetched_at', '2026-05-08T03:00:00+00:00');
    $response->assertJsonPath('data.stale', true);
});

it('returns 503 when upstream fails and there is no last_known value', function () {
    Http::fake([
        'v6.exchangerate-api.com/*' => Http::response('boom', 503),
    ]);

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(503);
    $response->assertJsonStructure(['message']);
});

it('returns 503 with a clear message when the api key is unset', function () {
    Config::set('services.exchange_rate.key', '');

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(503);
});

it('treats CHANGE_ME placeholder as not configured and falls back to last_known', function () {
    Config::set('services.exchange_rate.key', 'CHANGE_ME_EXCHANGE_RATE_API_KEY');

    Cache::forever(ExchangeRateService::LAST_KNOWN_KEY, [
        'rate' => 146.25,
        'fetched_at' => '2026-05-09T00:00:00+00:00',
    ]);

    $this->getJson('/api/v1/exchange-rate')
        ->assertStatus(200)
        ->assertJsonPath('data.rate', 146.25)
        ->assertJsonPath('data.stale', true);
});
