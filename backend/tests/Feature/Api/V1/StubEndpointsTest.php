<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns 503 with a Stage 4 message for /exchange-rate', function () {
    $response = $this->getJson('/api/v1/exchange-rate');
    $response->assertStatus(503);
    $response->assertJsonStructure(['message']);
    expect($response->json('message'))->toContain('Stage 4');
});

it('returns 503 with a Stage 4 message for /youtube-feed', function () {
    $this->getJson('/api/v1/youtube-feed')->assertStatus(503);
});

it('returns 503 with a Stage 4 message for /shipping-pdf', function () {
    $this->getJson('/api/v1/shipping-pdf')->assertStatus(503);
});
