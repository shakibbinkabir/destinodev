<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    Config::set('services.shipping_schedule.source_url', 'https://planetcars.test/roro');
});

/**
 * Mirrors the real source markup: one table, region heading cells with a
 * rowspan + <h5>, then carrier rows (carrier name, SCHEDULE anchor, optional
 * NEWS anchor or &nbsp;). Subsequent rows of a region omit the heading cell.
 */
function fakeRoroHtml(): string
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
          <td><a href="https://www.ecl.co.jp/schedule/pdf/ECL-SOUTHEASTASIA-PCC.pdf">SCHEDULE</a></td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td rowspan="1"><h5>MIDDLE EAST</h5></td>
          <td>MOL / K Line</td>
          <td><span><a href="http://www.interoceanshipping.co.jp/carteam/skd.pdf">SCHEDULE</a></span></td>
          <td>&nbsp;</td>
        </tr>
      </tbody>
    </table>
    </body></html>
    HTML;
}

it('scrapes the schedule, groups carriers by region, and caches the result', function () {
    Http::fake([
        'planetcars.test/*' => Http::response(fakeRoroHtml(), 200),
    ]);

    $response = $this->getJson('/api/v1/shipping-schedule');

    $response->assertStatus(200);
    $response->assertJsonPath('meta.stale', false);

    // Region grouping + order preserved.
    $response->assertJsonPath('data.0.region', 'ASIA');
    $response->assertJsonPath('data.1.region', 'MIDDLE EAST');

    // First region's carriers, including the rowspan continuation row.
    $response->assertJsonPath('data.0.carriers.0.name', 'TOYOFUJI');
    $response->assertJsonPath('data.0.carriers.0.schedule_url', 'https://www.toyofuji.co.jp/schedule/');
    $response->assertJsonPath('data.0.carriers.0.news_url', 'https://www.toyofuji.co.jp/news/');
    $response->assertJsonPath('data.0.carriers.1.name', 'EASTERN CAR LINER');
    expect($response->json('data.0.carriers.1.news_url'))->toBeNull();

    // Carrier name with stray inline markup normalises cleanly; anchor nested
    // in a <span> is still found.
    $response->assertJsonPath('data.1.carriers.0.name', 'MOL / K Line');
    $response->assertJsonPath('data.1.carriers.0.schedule_url', 'http://www.interoceanshipping.co.jp/carteam/skd.pdf');

    // Second hit is served from cache — no extra upstream request.
    $this->getJson('/api/v1/shipping-schedule')->assertStatus(200);
    Http::assertSentCount(1);
});

it('returns last_known with stale=true when upstream fails', function () {
    Cache::forever('shipping_schedule:roro:last_known', [
        'regions' => [
            ['region' => 'ASIA', 'carriers' => [
                ['name' => 'CACHED LINE', 'schedule_url' => 'https://example.test/s.pdf', 'news_url' => null],
            ]],
        ],
        'fetched_at' => '2026-06-01T00:00:00+00:00',
    ]);

    Http::fake([
        'planetcars.test/*' => Http::response('', 500),
    ]);

    $response = $this->getJson('/api/v1/shipping-schedule');

    $response->assertStatus(200);
    $response->assertJsonPath('meta.stale', true);
    $response->assertJsonPath('data.0.carriers.0.name', 'CACHED LINE');
});

it('returns 503 when upstream fails and there is no cached fallback', function () {
    Http::fake([
        'planetcars.test/*' => Http::response('', 500),
    ]);

    $this->getJson('/api/v1/shipping-schedule')->assertStatus(503);
});

it('returns 503 when the source HTML has no parseable schedule table', function () {
    Http::fake([
        'planetcars.test/*' => Http::response('<html><body><p>No table here.</p></body></html>', 200),
    ]);

    $this->getJson('/api/v1/shipping-schedule')->assertStatus(503);
});
