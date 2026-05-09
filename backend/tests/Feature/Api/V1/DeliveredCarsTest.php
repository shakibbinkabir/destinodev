<?php

use App\Models\DeliveredCar;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns paginated delivered cars with country and year facets', function () {
    DeliveredCar::factory()->count(5)->create([
        'destination_country' => 'Kenya',
        'year' => 2023,
    ]);
    DeliveredCar::factory()->count(3)->create([
        'destination_country' => 'United Arab Emirates',
        'year' => 2024,
    ]);

    $response = $this->getJson('/api/v1/delivered-cars');

    $response->assertOk();
    $response->assertJsonStructure([
        'data',
        'meta' => [
            'pagination',
            'facets' => ['countries', 'years'],
        ],
    ]);
    expect($response->json('meta.facets.countries'))->toEqual(['Kenya', 'United Arab Emirates']);
    expect($response->json('meta.facets.years'))->toEqual([2024, 2023]);
});

it('hides delivered cars with status=hidden', function () {
    DeliveredCar::factory()->count(2)->create(['status' => 'published']);
    DeliveredCar::factory()->create(['status' => 'hidden']);

    $response = $this->getJson('/api/v1/delivered-cars');

    expect($response->json('meta.pagination.total'))->toBe(2);
});

it('filters by country', function () {
    DeliveredCar::factory()->count(2)->create(['destination_country' => 'Kenya']);
    DeliveredCar::factory()->count(4)->create(['destination_country' => 'Tanzania']);

    $response = $this->getJson('/api/v1/delivered-cars?country=Kenya');

    expect($response->json('meta.pagination.total'))->toBe(2);
});
