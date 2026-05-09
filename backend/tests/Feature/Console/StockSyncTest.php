<?php

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.one_price_stock.url', 'https://api.example.test/listings');
    Config::set('services.one_price_stock.key', 'test-token');
});

function stockItem(array $overrides = []): array
{
    return array_merge([
        'id' => 'OPS-1001',
        'make' => 'Toyota',
        'model' => 'Land Cruiser 300',
        'year' => 2023,
        'price_jpy' => 12500000,
        'mileage_km' => 15000,
        'fuel' => 'gasoline',
        'transmission' => 'automatic',
        'body_type' => 'SUV',
        'color' => 'Pearl White',
        'drive_type' => '4wd',
        'engine_size' => '3.5L',
        'seats' => 7,
        'doors' => 5,
        'condition' => 'Excellent',
        'description' => 'Top-spec Land Cruiser, fully loaded.',
        'image_urls' => [
            'https://cdn.example.test/cars/OPS-1001/01.jpg',
            'https://cdn.example.test/cars/OPS-1001/02.jpg',
        ],
    ], $overrides);
}

it('exits 0 with a no-op warning when credentials are placeholders', function () {
    Config::set('services.one_price_stock.url', 'CHANGE_ME_ONE_PRICE_STOCK_API_URL');
    Config::set('services.one_price_stock.key', 'CHANGE_ME_ONE_PRICE_STOCK_API_KEY');

    Http::fake();

    $this->artisan('stock:sync')
        ->expectsOutputToContain('credentials are not configured')
        ->assertExitCode(0);

    Http::assertNothingSent();
    expect(Car::count())->toBe(0);
});

it('creates new cars and replaces images on first run', function () {
    Http::fake([
        'api.example.test/*' => Http::response(['data' => [stockItem()]], 200),
    ]);

    $this->artisan('stock:sync')->assertExitCode(0);

    $car = Car::where('external_id', 'OPS-1001')->firstOrFail();
    expect($car->source)->toBe('api');
    expect($car->status)->toBe('available');
    expect($car->make)->toBe('Toyota');
    expect($car->images)->toHaveCount(2);
    expect($car->images->first()->is_primary)->toBeTrue();
    expect($car->images->skip(1)->first()->is_primary)->toBeFalse();
});

it('updates an existing car in place and replaces its image set', function () {
    $existing = Car::factory()->create([
        'external_id' => 'OPS-1001',
        'source' => 'api',
        'status' => 'available',
        'price_jpy' => 11000000,
    ]);
    CarImage::create([
        'car_id' => $existing->id,
        'path' => 'https://stale.example.test/old.jpg',
        'sort_order' => 0,
        'is_primary' => true,
    ]);

    Http::fake([
        'api.example.test/*' => Http::response(['data' => [stockItem(['price_jpy' => 12500000])]], 200),
    ]);

    $this->artisan('stock:sync')->assertExitCode(0);

    $existing->refresh();
    expect((float) $existing->price_jpy)->toBe(12500000.0);
    expect($existing->images()->count())->toBe(2);
    expect($existing->images()->where('path', 'like', '%stale.example.test%')->exists())->toBeFalse();
});

it('marks api cars absent from the latest fetch as sold', function () {
    Car::factory()->create(['external_id' => 'OPS-2222', 'source' => 'api', 'status' => 'available']);
    Car::factory()->create(['external_id' => null, 'source' => 'inhouse', 'status' => 'available']); // untouched

    Http::fake([
        'api.example.test/*' => Http::response(['data' => [stockItem(['id' => 'OPS-1001'])]], 200),
    ]);

    $this->artisan('stock:sync')->assertExitCode(0);

    expect(Car::where('external_id', 'OPS-2222')->value('status'))->toBe('sold');
    expect(Car::where('source', 'inhouse')->value('status'))->toBe('available');
});

it('exits non-zero and leaves DB untouched on upstream HTTP failure', function () {
    Car::factory()->create(['external_id' => 'OPS-2222', 'source' => 'api', 'status' => 'available']);

    Http::fake([
        'api.example.test/*' => Http::response('boom', 500),
    ]);

    $this->artisan('stock:sync')->assertExitCode(1);

    expect(Car::where('external_id', 'OPS-2222')->value('status'))->toBe('available');
});

it('aborts when the upstream returns an empty list', function () {
    Car::factory()->create(['external_id' => 'OPS-2222', 'source' => 'api', 'status' => 'available']);

    Http::fake([
        'api.example.test/*' => Http::response(['data' => []], 200),
    ]);

    $this->artisan('stock:sync')->assertExitCode(1);

    expect(Car::where('external_id', 'OPS-2222')->value('status'))->toBe('available');
});
