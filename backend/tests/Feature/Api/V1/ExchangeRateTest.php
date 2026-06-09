<?php

use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

const MUFG_URL = 'https://www.bk.mufg.jp/ippan/kinri/list_j/kinri/kawase.html';

/**
 * A trimmed snapshot of the MUFG rate table. USD is fully populated; SEK is
 * dash-padded (CASH S. / CASH B. unconfirmed) to exercise positional parsing —
 * a naive "Nth number" reader would misalign SEK's columns.
 *
 * Column order: T.T.S., ACC., CASH S., T.T.B., A/S, D/P・D/A, CASH B.
 */
function mufgHtml(string $usdTtb = '159.32'): string
{
    return <<<HTML
    <table>
      <tr><th>通貨名</th><th>T.T.S.</th><th>ACC.</th><th>CASH S.</th><th>T.T.B.</th><th>A/S</th><th>D/P・D/A</th><th>CASH B.</th></tr>
      <tr><td>001</td><td>USD<br>(米ドル)</td><td>161.32</td><td>161.73</td><td>163.12</td><td>{$usdTtb}</td><td>158.91</td><td>158.61</td><td>157.32</td></tr>
      <tr><td>007</td><td>SEK<br>(スウェーデン・クローナ)</td><td>17.38</td><td>17.42</td><td>----</td><td>16.58</td><td>16.54</td><td>16.48</td><td>----</td></tr>
    </table>
    HTML;
}

beforeEach(function () {
    Cache::flush();
    Config::set('services.exchange_rate.mufg_url', MUFG_URL);
    Config::set('services.exchange_rate.ttb_offset', 4);
});

it('parses the USD T.T.B. column positionally, ignoring dash-padded rows', function () {
    $ttb = app(ExchangeRateService::class)->parse(mufgHtml('159.32'));

    expect($ttb)->toBe(159.32);
});

it('fetches a fresh rate (TTB − 4), caches it, and returns stale=false', function () {
    Http::fake([
        'www.bk.mufg.jp/*' => Http::response(mufgHtml('159.32'), 200),
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
        'www.bk.mufg.jp/*' => Http::response(mufgHtml('150.50'), 200),
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
        'www.bk.mufg.jp/*' => Http::response(mufgHtml('----'), 200),
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
