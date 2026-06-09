<?php

use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    Config::set('services.exchange_rate.mufg_url', 'https://www.bk.mufg.jp/gdocs/kinri/kinri_data_utf8.js');
    Config::set('services.exchange_rate.ttb_offset', 4);
});

function mufgSyncFeed(string $usdTtb = '159.32'): string
{
    return <<<JS
    var kinri_deta = {
     "G001TTSZ":"   161.32",
     "G001TTBZ":"   {$usdTtb}",
     "G001DATE":"2026/06/09 10:26",
     "G020TTBZ":"   183.30"
    };
    JS;
}

it('refreshes the cached rate and reports success', function () {
    Http::fake(['www.bk.mufg.jp/*' => Http::response(mufgSyncFeed('159.32'), 200)]);

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
