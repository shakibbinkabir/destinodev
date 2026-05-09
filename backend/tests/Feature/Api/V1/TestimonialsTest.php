<?php

use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns only approved testimonials', function () {
    Testimonial::factory()->count(3)->create(['status' => 'approved']);
    Testimonial::factory()->count(2)->create(['status' => 'pending']);
    Testimonial::factory()->create(['status' => 'rejected']);

    $response = $this->getJson('/api/v1/testimonials');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(3);
});

it('hides the email field from the public response', function () {
    Testimonial::factory()->create([
        'status' => 'approved',
        'email' => 'private@example.com',
    ]);

    $response = $this->getJson('/api/v1/testimonials');

    $response->assertOk();
    $row = $response->json('data.0');
    expect($row)->not->toHaveKey('email');
});

it('filters by featured when ?featured=true is supplied', function () {
    Testimonial::factory()->count(2)->create(['status' => 'approved', 'featured' => true]);
    Testimonial::factory()->count(3)->create(['status' => 'approved', 'featured' => false]);

    $response = $this->getJson('/api/v1/testimonials?featured=true');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});
