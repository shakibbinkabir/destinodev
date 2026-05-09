<?php

use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a pending testimonial when a valid review is posted', function () {
    $payload = [
        'name' => 'John Smith',
        'country' => 'UK',
        'vehicle' => 'Toyota Hiace 2022',
        'rating' => 5,
        'text' => 'Excellent service from Destino, prompt shipping, accurate condition report.',
        'email' => 'john@example.com',
    ];

    $response = $this->postJson('/api/v1/reviews', $payload);

    $response->assertStatus(201);
    $response->assertJsonStructure(['data' => ['id']]);

    $row = Testimonial::firstOrFail();
    expect($row->status)->toBe('pending');
    expect($row->name)->toBe('John Smith');
    expect($row->rating)->toBe(5);
    expect($row->email)->toBe('john@example.com');
    expect($row->featured)->toBeFalse();
});

it('returns 422 when rating is out of range', function () {
    $response = $this->postJson('/api/v1/reviews', [
        'name' => 'John',
        'rating' => 7,
        'text' => 'Too high',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['rating']);
});

it('returns 422 when required fields are missing', function () {
    $response = $this->postJson('/api/v1/reviews', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'rating', 'text']);
});
