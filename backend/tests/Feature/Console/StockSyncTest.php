<?php

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.one_price_stock.base_url', 'https://jdmauction.live/oneprice/api');
    Config::set('services.one_price_stock.username', 'destino');
    Config::set('services.one_price_stock.key', 'test-key');
    Config::set('services.one_price_stock.makers', '9');
});

/**
 * Fake one search-auction response page.
 *
 * @param  list<array<string, mixed>>  $items
 */
function onePriceResponse(array $items, int $currentPage = 0, int $totalPages = 1): array
{
    return [
        'status' => 'SUCCESS',
        'message' => 'Successfully retrieved vehicle data',
        'code' => 200,
        'auctionData' => $items,
        'totalResults' => count($items),
        'currentPage' => $currentPage,
        'totalPages' => $totalPages,
    ];
}

/** Build a vendor-shaped lot item with sensible Toyota Prius defaults. */
function onePriceItem(array $overrides = []): array
{
    return array_merge([
        'id' => 968221597,
        'date' => '2026-04-09',
        'bid' => '65134',
        'auctRef' => '149',
        'auctionSystem' => 'IAUC_STOCK',
        'auctionHouse' => 'Ippatsu Stock',
        'datetime' => '2026-04-09 11:00:00',
        'isOnePrice' => '1',
        'companyEn' => 'TOYOTA',
        'companyRef' => '9',
        'modelNameEn' => 'PRIUS',
        'modelNameRef' => '718',
        'modelYearEn' => '2019',
        'modelDetailsEn' => '',
        'modelGradeEn' => 'S SAFETY SENSPKSB',
        'modelTypeEn' => 'ZVW51',
        'mileageNum' => 91,
        'inspectionEn' => '',
        'equipmentEn' => 'AAC',
        'transmissionEn' => 'IAT',
        'awdNum' => '0',
        'displacement' => '1800',
        'displacementNum' => 1800,
        'startPriceNum' => '1290000',
        'endPriceNum' => null,
        'colorEn' => 'PEARL',
        'colorRef' => '9',
        'scoresEn' => '4',
        'result' => 'Available',
        'jdmPictures' => 'https://p1.jdmauction.live/pic/?system=auto&date=2026-04-09&auct=149&bid=65134&number=0#https://p1.jdmauction.live/pic/?system=auto&date=2026-04-09&auct=149&bid=65134&number=1#https://p1.jdmauction.live/pic/?system=auto&date=2026-04-09&auct=149&bid=65134&number=2',
        'searchImg' => 'https://p1.jdmauction.live/pic/?system=auto&date=2026-04-09&auct=149&bid=65134&number=1',
        'parsedDataEn' => '<![CDATA[{" form ":" sedan "}]]>',
    ], $overrides);
}

it('no-ops gracefully when credentials are placeholders', function () {
    Config::set('services.one_price_stock.username', 'CHANGE_ME_ONE_PRICE_STOCK_API_USERNAME');
    Config::set('services.one_price_stock.key', 'CHANGE_ME_ONE_PRICE_STOCK_API_KEY');

    Http::fake();

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718'])
        ->expectsOutputToContain('Credentials missing')
        ->assertExitCode(0);

    Http::assertNothingSent();
    expect(Car::count())->toBe(0);
});

it('no-ops with a warning when ONE_PRICE_STOCK_MAKERS is empty and no CLI override', function () {
    Config::set('services.one_price_stock.makers', '');

    Http::fake();

    $this->artisan('stock:sync')
        ->expectsOutputToContain('No (maker, model) pairs')
        ->assertExitCode(0);

    Http::assertNothingSent();
});

it('creates new cars and replaces images on first run', function () {
    Http::fake([
        'jdmauction.live/oneprice/api/search-auction*' => Http::response(
            onePriceResponse([onePriceItem()]),
            200,
        ),
    ]);

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718'])
        ->assertExitCode(0);

    $car = Car::where('external_id', '968221597')->firstOrFail();
    expect($car->source)->toBe('api');
    expect($car->status)->toBe('available');
    expect($car->make)->toBe('Toyota');
    expect($car->model)->toBe('Prius');
    expect($car->year)->toBe(2019);
    expect((float) $car->price_jpy)->toBe(1290000.0);
    expect($car->mileage_km)->toBe(91000);
    expect($car->fuel)->toBe('hybrid'); // PRIUS keyword infers hybrid
    expect($car->color)->toBe('Pearl');
    expect($car->engine_size)->toBe('1.8L');
    expect($car->chassis_code)->toBe('ZVW51');
    expect($car->lot_bid)->toBe('65134');
    expect($car->auction_house)->toBe('Ippatsu Stock');
    expect($car->auction_grade)->toBe('4');
    expect($car->images)->toHaveCount(3);
    expect($car->images->first()->is_primary)->toBeTrue();
    // Auction-sheet (number=0) must be last; photos (number=1, 2) lead.
    expect($car->images[0]->path)->toContain('number=1');
    expect($car->images[1]->path)->toContain('number=2');
    expect($car->images[2]->path)->toContain('number=0');
});

it('walks pagination across pages until the last page is reached', function () {
    Http::fake(function ($request) {
        $page = (int) ($request->data()['page'] ?? 1);
        $item = onePriceItem(['id' => 1000 + $page]);
        return Http::response(onePriceResponse([$item], currentPage: $page - 1, totalPages: 3), 200);
    });

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718', '--max-pages' => '5'])
        ->assertExitCode(0);

    expect(Car::where('source', 'api')->count())->toBe(3);
    expect(Car::where('external_id', '1001')->exists())->toBeTrue();
    expect(Car::where('external_id', '1003')->exists())->toBeTrue();
});

it('updates an existing api car in place and replaces its image set', function () {
    $existing = Car::factory()->create([
        'external_id' => '968221597',
        'source' => 'api',
        'status' => 'available',
        'price_jpy' => 1100000,
        'make' => 'Toyota',
        'model' => 'Prius',
    ]);
    CarImage::create([
        'car_id' => $existing->id,
        'path' => 'https://stale.example.test/old.jpg',
        'sort_order' => 0,
        'is_primary' => true,
    ]);

    Http::fake([
        'jdmauction.live/*' => Http::response(
            onePriceResponse([onePriceItem(['startPriceNum' => '1290000'])]),
            200,
        ),
    ]);

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718'])
        ->assertExitCode(0);

    $existing->refresh();
    expect((float) $existing->price_jpy)->toBe(1290000.0);
    expect($existing->images()->count())->toBe(3);
    expect($existing->images()->where('path', 'like', '%stale.example.test%')->exists())->toBeFalse();
});

it('marks api cars in the visited make+model as sold when absent from the fetch', function () {
    Car::factory()->create([
        'external_id' => '111',
        'source' => 'api',
        'status' => 'available',
        'make' => 'Toyota',
        'model' => 'Prius',
    ]);
    // Different (make, model) — must not be touched even though we synced Toyota Prius.
    Car::factory()->create([
        'external_id' => '222',
        'source' => 'api',
        'status' => 'available',
        'make' => 'Honda',
        'model' => 'Fit',
    ]);
    Car::factory()->create([
        'external_id' => null,
        'source' => 'inhouse',
        'status' => 'available',
        'make' => 'Toyota',
        'model' => 'Prius',
    ]);

    Http::fake([
        'jdmauction.live/*' => Http::response(
            onePriceResponse([onePriceItem(['id' => '968221597'])]),
            200,
        ),
    ]);

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718'])
        ->assertExitCode(0);

    expect(Car::where('external_id', '111')->value('status'))->toBe('sold');
    expect(Car::where('external_id', '222')->value('status'))->toBe('available'); // Honda untouched
    expect(Car::where('source', 'inhouse')->value('status'))->toBe('available');
});

it('leaves the DB untouched on upstream HTTP failure', function () {
    Car::factory()->create([
        'external_id' => '111',
        'source' => 'api',
        'status' => 'available',
        'make' => 'Toyota',
        'model' => 'Prius',
    ]);

    Http::fake([
        'jdmauction.live/*' => Http::response('boom', 500),
    ]);

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718'])
        ->assertExitCode(1);

    expect(Car::where('external_id', '111')->value('status'))->toBe('available');
});

it('aborts when every pair returns zero items', function () {
    Car::factory()->create([
        'external_id' => '111',
        'source' => 'api',
        'status' => 'available',
        'make' => 'Toyota',
        'model' => 'Prius',
    ]);

    Http::fake([
        'jdmauction.live/*' => Http::response(onePriceResponse([], totalPages: 0), 200),
    ]);

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718'])
        ->assertExitCode(1);

    expect(Car::where('external_id', '111')->value('status'))->toBe('available');
});

it('rejects --model without --maker', function () {
    Http::fake();

    $this->artisan('stock:sync', ['--model' => '718'])
        ->expectsOutputToContain('--model requires --maker')
        ->assertExitCode(1);

    Http::assertNothingSent();
});

it('rejects an unknown --maker company_id', function () {
    Http::fake();

    $this->artisan('stock:sync', ['--maker' => '99999'])
        ->expectsOutputToContain('Unknown maker')
        ->assertExitCode(1);

    Http::assertNothingSent();
});

it('dry-run fetches but writes nothing', function () {
    Http::fake([
        'jdmauction.live/*' => Http::response(
            onePriceResponse([onePriceItem()]),
            200,
        ),
    ]);

    $this->artisan('stock:sync', ['--maker' => '9', '--model' => '718', '--dry-run' => true])
        ->expectsOutputToContain('dry-run')
        ->assertExitCode(0);

    expect(Car::count())->toBe(0);
});
