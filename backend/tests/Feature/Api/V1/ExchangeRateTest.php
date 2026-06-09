<?php

use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

const MUFG_URL = 'https://www.bk.mufg.jp/gdocs/kinri/kinri_data_utf8.js';

/**
 * A trimmed snapshot of the MUFG data feed (kinri_data_utf8.js). Values are
 * space-padded strings keyed by element id; USD T.T.B. is G001TTBZ. The page
 * itself ships every cell as "----" and fills them in from this feed.
 */
function mufgFeed(string $usdTtb = '159.32'): string
{
    return <<<JS
    var kinri_deta = {
     "G001TTSZ":"   161.32",
     "G001CASS":"   163.12",
     "G001TTBZ":"   {$usdTtb}",
     "G001CASB":"   157.32",
     "G001DATE":"2026/06/09 10:26",
     "G007TTBZ":"    16.58"
    };
    JS;
}

beforeEach(function () {
    Cache::flush();
    Config::set('services.exchange_rate.mufg_url', MUFG_URL);
    Config::set('services.exchange_rate.ttb_offset', 4);
});

it('parses the USD T.T.B. value (G001TTBZ) from the MUFG data feed', function () {
    $ttb = app(ExchangeRateService::class)->parse(mufgFeed('159.32'));

    expect($ttb)->toBe(159.32);
});

it('fetches a fresh rate (TTB − 4), caches it, and returns stale=false', function () {
    Http::fake([
        'www.bk.mufg.jp/*' => Http::response(mufgFeed('159.32'), 200),
    ]);

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(200);
    $response->assertJsonPath('data.from', 'USD');
    $response->assertJsonPath('data.to', 'JPY');
    $response->assertJsonPath('data.rate', 155.32); // 159.32 − 4
    $response->assertJsonPath('data.stale', false);

    expect(Cache::get(ExchangeRateService::CACHE_KEY))->toBeArray();
    expect(Cache::get(ExchangeRateService::LAST_KNOWN_KEY))->toBeArray();
});

it('serves the cached value on the second call without re-hitting upstream', function () {
    Http::fake([
        'www.bk.mufg.jp/*' => Http::response(mufgFeed('150.50'), 200),
    ]);

    $this->getJson('/api/v1/exchange-rate')->assertStatus(200);
    $this->getJson('/api/v1/exchange-rate')->assertStatus(200)
        ->assertJsonPath('data.rate', 146.50) // 150.50 − 4
        ->assertJsonPath('data.stale', false);

    Http::assertSentCount(1);
});

it('falls back to last_known with stale=true when upstream returns 5xx', function () {
    Cache::forever(ExchangeRateService::LAST_KNOWN_KEY, [
        'rate' => 147.10,
        'fetched_at' => '2026-05-08T03:00:00+00:00',
    ]);

    Http::fake([
        'www.bk.mufg.jp/*' => Http::response('boom', 503),
    ]);

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(200);
    $response->assertJsonPath('data.rate', 147.10);
    $response->assertJsonPath('data.fetched_at', '2026-05-08T03:00:00+00:00');
    $response->assertJsonPath('data.stale', true);
});

it('falls back to last_known when MUFG publishes "----" (unconfirmed) for USD', function () {
    Cache::forever(ExchangeRateService::LAST_KNOWN_KEY, [
        'rate' => 152.10,
        'fetched_at' => '2026-06-08T01:00:00+00:00',
    ]);

    Http::fake([
        'www.bk.mufg.jp/*' => Http::response(mufgFeed('----'), 200),
    ]);

    $this->getJson('/api/v1/exchange-rate')
        ->assertStatus(200)
        ->assertJsonPath('data.rate', 152.10)
        ->assertJsonPath('data.stale', true);

    // An unconfirmed reading must NOT poison the fresh cache.
    expect(Cache::get(ExchangeRateService::CACHE_KEY))->toBeNull();
});

it('returns 503 when upstream fails and there is no last_known value', function () {
    Http::fake([
        'www.bk.mufg.jp/*' => Http::response('boom', 503),
    ]);

    $response = $this->getJson('/api/v1/exchange-rate');

    $response->assertStatus(503);
    $response->assertJsonStructure(['message']);
});

it('returns 503 with a clear message when the MUFG url is unset', function () {
    Config::set('services.exchange_rate.mufg_url', '');

    $this->getJson('/api/v1/exchange-rate')->assertStatus(503);
});
