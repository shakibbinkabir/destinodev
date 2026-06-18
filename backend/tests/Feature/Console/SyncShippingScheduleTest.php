<?php

use App\Services\ShippingScheduleService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    Config::set('services.shipping_schedule.source_url', 'https://planetcars.test/roro');
});

function syncRoroHtml(): string
{
    return <<<'HTML'
    <!DOCTYPE html><html><body>
    <table>
      <thead><tr><th>DESTINATION</th><th>CARRIER</th><th>SCHEDULE</th><th>NEWS</th></tr></thead>
      <tbody>
        <tr>
          <td rowspan="2"><h5>ASIA</h5></td>
          <td>TOYOFUJI</td>
          <td><a href="https://www.toyofuji.co.jp/schedule/">SCHEDULE</a></td>
          <td><a href="https://www.toyofuji.co.jp/news/">NEWS</a></td>
        </tr>
        <tr>
          <td>EASTERN CAR LINER</td>
          <td><a href="https://www.ecl.co.jp/ECL-SOUTHEASTASIA-PCC.pdf">SCHEDULE</a></td>
          <td>&nbsp;</td>
        </tr>
      </tbody>
    </table>
    </body></html>
    HTML;
}

it('refreshes the cached schedule and reports success', function () {
    Http::fake(['planetcars.test/*' => Http::response(syncRoroHtml(), 200)]);

    $this->artisan('shipping-schedule:sync')->assertSuccessful();

    $cached = Cache::get(ShippingScheduleService::CACHE_KEY);
    expect($cached['regions'][0]['region'])->toBe('ASIA');
    expect($cached['regions'][0]['carriers'])->toHaveCount(2);
    expect(Cache::get(ShippingScheduleService::LAST_KNOWN_KEY)['regions'][0]['region'])->toBe('ASIA');
});

it('exits successfully and keeps last_known when the source is unavailable', function () {
    Cache::forever(ShippingScheduleService::LAST_KNOWN_KEY, [
        'regions' => [
            ['region' => 'ASIA', 'carriers' => [
                ['name' => 'CACHED LINE', 'schedule_url' => 'https://example.test/s.pdf', 'news_url' => null],
            ]],
        ],
        'fetched_at' => '2026-06-01T00:00:00+00:00',
    ]);

    Http::fake(['planetcars.test/*' => Http::response('down', 503)]);

    $this->artisan('shipping-schedule:sync')->assertSuccessful();

    // Fresh cache stays empty; last-known is untouched.
    expect(Cache::get(ShippingScheduleService::CACHE_KEY))->toBeNull();
    expect(Cache::get(ShippingScheduleService::LAST_KNOWN_KEY)['regions'][0]['carriers'][0]['name'])->toBe('CACHED LINE');
});
