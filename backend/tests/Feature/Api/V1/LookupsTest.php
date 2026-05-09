<?php

use App\Models\Car;
use App\Models\HeroSlide;
use App\Models\PageContent;
use App\Models\Partner;
use App\Models\ProcessStep;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns alphabetized distinct makes excluding hidden cars', function () {
    Car::factory()->create(['make' => 'Toyota']);
    Car::factory()->create(['make' => 'Nissan']);
    Car::factory()->create(['make' => 'Toyota']); // duplicate
    Car::factory()->create(['make' => 'BMW']);
    Car::factory()->create(['make' => 'Lexus', 'status' => 'hidden']); // excluded

    $response = $this->getJson('/api/v1/makes');

    $response->assertOk();
    expect($response->json('data'))->toEqual(['BMW', 'Nissan', 'Toyota']);
});

it('returns alphabetized distinct body types', function () {
    Car::factory()->create(['body_type' => 'SUV']);
    Car::factory()->create(['body_type' => 'Sedan']);
    Car::factory()->create(['body_type' => 'SUV']);

    $response = $this->getJson('/api/v1/body-types');

    $response->assertOk();
    expect($response->json('data'))->toEqual(['SUV', 'Sedan']);
});

it('serves a known page slug and 404s an unknown one', function () {
    PageContent::create([
        'slug' => 'about',
        'title' => 'About Destino',
        'body' => '# About',
        'extras' => null,
    ]);

    $this->getJson('/api/v1/page/about')->assertOk()->assertJsonPath('data.slug', 'about');
    $this->getJson('/api/v1/page/nope')->assertStatus(404);
});

it('returns active hero slides ordered by sort_order', function () {
    HeroSlide::factory()->create(['active' => true, 'sort_order' => 2, 'title' => 'B']);
    HeroSlide::factory()->create(['active' => true, 'sort_order' => 1, 'title' => 'A']);
    HeroSlide::factory()->create(['active' => false, 'sort_order' => 0, 'title' => 'Hidden']);

    $response = $this->getJson('/api/v1/hero-slides');

    $response->assertOk();
    expect(collect($response->json('data'))->pluck('title')->all())->toEqual(['A', 'B']);
});

it('returns active partners only', function () {
    Partner::factory()->create(['active' => true, 'sort_order' => 1, 'name' => 'P1']);
    Partner::factory()->create(['active' => false, 'sort_order' => 2, 'name' => 'P2']);

    $response = $this->getJson('/api/v1/partners');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.name'))->toBe('P1');
});

it('returns active services and process steps ordered by sort_order', function () {
    Service::factory()->create(['active' => true, 'sort_order' => 2, 'title' => 'Y']);
    Service::factory()->create(['active' => true, 'sort_order' => 1, 'title' => 'X']);
    Service::factory()->create(['active' => false, 'sort_order' => 0, 'title' => 'Z']);

    ProcessStep::factory()->create(['active' => true, 'sort_order' => 2, 'title' => 'B']);
    ProcessStep::factory()->create(['active' => true, 'sort_order' => 1, 'title' => 'A']);

    expect(collect($this->getJson('/api/v1/services')->json('data'))->pluck('title')->all())->toEqual(['X', 'Y']);
    expect(collect($this->getJson('/api/v1/process-steps')->json('data'))->pluck('title')->all())->toEqual(['A', 'B']);
});
