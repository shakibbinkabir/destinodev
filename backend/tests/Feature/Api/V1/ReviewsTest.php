<?php

use App\Mail\PendingReviewNotification;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    Mail::fake();
});

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

it('queues a pending review notification on success', function () {
    $payload = [
        'name' => 'John Smith',
        'rating' => 5,
        'text' => 'Excellent service from Destino.',
    ];

    $this->postJson('/api/v1/reviews', $payload)->assertStatus(201);

    $testimonial = Testimonial::firstOrFail();

    Mail::assertQueued(PendingReviewNotification::class, function ($mail) use ($testimonial) {
        return $mail->testimonial->is($testimonial);
    });
});

it('does not queue mail when review validation fails', function () {
    $this->postJson('/api/v1/reviews', [])->assertStatus(422);

    Mail::assertNothingQueued();
});
