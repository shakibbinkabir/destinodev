<?php

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('returns a paginated list with the documented envelope', function () {
    Car::factory()
        ->count(15)
        ->has(CarImage::factory()->count(2), 'images')
        ->create();

    $response = $this->getJson('/api/v1/cars');

    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [
            ['id', 'make', 'model', 'year', 'price', 'mileage', 'fuel', 'transmission', 'body_type', 'images'],
        ],
        'meta' => [
            'pagination' => ['current_page', 'per_page', 'total', 'last_page'],
        ],
    ]);

    $body = $response->json();
    expect($body['meta']['pagination']['per_page'])->toBe(9);
    expect($body['meta']['pagination']['total'])->toBe(15);
    expect($body['meta']['pagination']['last_page'])->toBe(2);
    expect($body['data'])->toHaveCount(9);
    expect($body)->not->toHaveKey('links'); // legacy paginator artefact must not leak
});

it('filters by make to narrow the result set', function () {
    Car::factory()->count(3)->create(['make' => 'Toyota']);
    Car::factory()->count(5)->create(['make' => 'Nissan']);

    $response = $this->getJson('/api/v1/cars?make=Toyota');

    $response->assertOk();
    expect($response->json('meta.pagination.total'))->toBe(3);
    expect(collect($response->json('data'))->pluck('make')->unique()->all())->toEqual(['Toyota']);
});

it('sorts by price_asc cheapest first', function () {
    Car::factory()->create(['price_jpy' => 9_000_000]);
    Car::factory()->create(['price_jpy' => 1_500_000]);
    Car::factory()->create(['price_jpy' => 4_500_000]);

    $response = $this->getJson('/api/v1/cars?sort=price_asc');

    $response->assertOk();
    $prices = collect($response->json('data'))->pluck('price')->all();
    expect($prices)->toEqual([1_500_000, 4_500_000, 9_000_000]);
});

it('caps per_page at 50 even when a larger value is requested', function () {
    Car::factory()->count(60)->create();

    $response = $this->getJson('/api/v1/cars?per_page=200');

    $response->assertOk();
    expect($response->json('meta.pagination.per_page'))->toBe(50);
    expect($response->json('data'))->toHaveCount(50);
});

it('returns 200 with the car payload for a known id', function () {
    $car = Car::factory()
        ->has(CarImage::factory()->count(2), 'images')
        ->create([
            'make' => 'Toyota',
            'model' => 'Land Cruiser 300',
        ]);

    $response = $this->getJson("/api/v1/cars/{$car->id}");

    $response->assertOk();
    $response->assertJsonPath('data.id', $car->id);
    $response->assertJsonPath('data.make', 'Toyota');
    $response->assertJsonPath('data.model', 'Land Cruiser 300');
    expect($response->json('data.images'))->toHaveCount(2);
});

it('returns 404 for an unknown car id', function () {
    $this->getJson('/api/v1/cars/999999')->assertStatus(404);
});

it('returns 404 for cars with status hidden', function () {
    $car = Car::factory()->create(['status' => 'hidden']);

    $this->getJson("/api/v1/cars/{$car->id}")->assertStatus(404);
});

it('does not include hidden cars in the list', function () {
    Car::factory()->count(2)->create(['status' => 'available']);
    Car::factory()->create(['status' => 'hidden']);

    $response = $this->getJson('/api/v1/cars');

    expect($response->json('meta.pagination.total'))->toBe(2);
});

it('returns up to 6 similar cars matching make or body_type, excluding the current car', function () {
    $target = Car::factory()->create([
        'make' => 'Toyota',
        'body_type' => 'SUV',
        'year' => 2023,
    ]);

    Car::factory()->count(4)->create(['make' => 'Toyota', 'body_type' => 'Sedan', 'year' => 2022]);
    Car::factory()->count(4)->create(['make' => 'Nissan', 'body_type' => 'SUV', 'year' => 2024]);
    Car::factory()->count(3)->create(['make' => 'Honda', 'body_type' => 'Hatchback', 'year' => 2020]); // unrelated

    $response = $this->getJson("/api/v1/cars/{$target->id}/similar");

    $response->assertOk();
    $data = $response->json('data');
    expect($data)->toHaveCount(6);
    expect(collect($data)->pluck('id'))->not->toContain($target->id);
    foreach ($data as $row) {
        expect($row['make'] === 'Toyota' || $row['body_type'] === 'SUV')->toBeTrue();
    }
});

it('does not run an N+1 query for the cars list', function () {
    Car::factory()
        ->count(10)
        ->has(CarImage::factory()->count(3), 'images')
        ->create();

    $queries = 0;
    DB::listen(function () use (&$queries): void {
        $queries++;
    });

    $this->getJson('/api/v1/cars')->assertOk();

    // 1 count + 1 cars + 1 images eager load + a few framework queries (sessions/etc.).
    // Without eager loading we'd see 1 + 10 = 11 image queries. Cap well under that.
    expect($queries)->toBeLessThanOrEqual(8);
});
