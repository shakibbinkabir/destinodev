<?php

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::forget('api:settings:flat');
});

it('returns a flat key->value object with type coercion', function () {
    Setting::create(['key' => 'company.name', 'value' => 'Destino', 'type' => 'string']);
    Setting::create(['key' => 'homepage.youtube_enabled', 'value' => '1', 'type' => 'bool']);
    Setting::create(['key' => 'company.year_founded', 'value' => '1995', 'type' => 'int']);
    Setting::create(['key' => 'social.networks', 'value' => json_encode(['fb', 'ig']), 'type' => 'json']);

    $response = $this->getJson('/api/v1/settings');

    $response->assertOk();

    // Setting keys themselves contain dots (e.g. "company.name"); fetch the full
    // data dictionary instead of using Pest's dot-path accessor, which would
    // otherwise try to navigate {company: {name: ...}}.
    $data = $response->json('data');

    expect($data['company.name'])->toBe('Destino');
    expect($data['homepage.youtube_enabled'])->toBeTrue();
    expect($data['company.year_founded'])->toBe(1995);
    expect($data['social.networks'])->toEqual(['fb', 'ig']);
});

it('caches the response under the documented key', function () {
    Setting::create(['key' => 'company.name', 'value' => 'Destino', 'type' => 'string']);

    $this->getJson('/api/v1/settings')->assertOk();

    expect(Cache::has('api:settings:flat'))->toBeTrue();
});
