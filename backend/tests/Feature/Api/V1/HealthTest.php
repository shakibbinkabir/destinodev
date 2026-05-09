<?php

it('returns 200 with ok status and ISO 8601 UTC time', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertStatus(200);
    $response->assertJsonStructure(['status', 'time']);
    $response->assertJson(['status' => 'ok']);

    $time = $response->json('time');
    expect($time)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\+00:00|Z)$/');
});
