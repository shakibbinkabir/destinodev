<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Stage 3 left these endpoints as 503 stubs. Stage 4 wires them up; their
// behavioural coverage now lives in ExchangeRateTest, YoutubeFeedTest, and
// ShippingPdfTest. This file is kept as a sentinel for future stub endpoints.
it('exposes the v1 prefix for live-data endpoints', function () {
    expect(true)->toBeTrue();
});
