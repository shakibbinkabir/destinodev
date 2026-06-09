<?php

use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    Config::set('services.exchange_rate.mufg_url', 'https://www.bk.mufg.jp/ippan/kinri/list_j/kinri/kawase.html');
    Config::set('services.exchange_rate.ttb_offset', 4);
});

function mufgSyncHtml(string $usdTtb = '159.32'): string
{
    return <<<HTML
    <table>
      <tr><td>001</td><td>USD<br>(米ドル)</td><td>161.32</td><td>161.73</td><td>163.12</td><td>{$usdTtb}</td><td>158.91</td><td>158.61</td><td>157.32</td></tr>
      <tr><td>020</td><td>EUR<br>(ユーロ)</td><td>186.30</td><td>186.73</td><td>188.80</td><td>183.30</td><td>182.87</td><td>182.62</td><td>180.80</td></tr>
    </table>
    HTML;
}

it('refreshes the cached rate and reports success', function () {
    Http::fake(['www.bk.mufg.jp/*' => Http::response(mufgSyncHtml('159.32'), 200)]);

    $this->artisan('exchange-rate:sync')->assertSuccessful();

    expect(Cache::get(ExchangeRateService::CACHE_KEY)['rate'])->toBe(155.32);
    expect(Cache::get(ExchangeRateService::LAST_KNOWN_KEY)['rate'])->toBe(155.32);
});

it('exits successfully and keeps last_known when MUFG is unavailable', function () {
    Cache::forever(ExchangeRateService::LAST_KNOWN_KEY, [
        'rate' => 150.25,
        'fetched_at' => '2026-06-08T01:00:00+00:00',
    ]);

    Http::fake(['www.bk.mufg.jp/*' => Http::response('down', 503)]);

    $this->artisan('exchange-rate:sync')->assertSuccessful();

    // Fresh cache stays empty; last-known is untouched.
    expect(Cache::get(ExchangeRateService::CACHE_KEY))->toBeNull();
    expect(Cache::get(ExchangeRateService::LAST_KNOWN_KEY)['rate'])->toBe(150.25);
});
