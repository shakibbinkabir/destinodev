<?php

use App\Mail\CustomerInquiryConfirmation;
use App\Mail\NewInquiryNotification;
use App\Models\Car;
use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function () {
    RateLimiter::clear('throttle:10,1');
    Mail::fake();
    // Throttle keys are derived from route signature + IP; cache is fresh
    // per test under the array driver, so no further teardown is needed.
});

it('creates an inquiry and returns 201 with id and received_at', function () {
    $car = Car::factory()->create();

    $payload = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '+254712345678',
        'country' => 'Kenya',
        'message' => 'Interested in this Land Cruiser.',
        'car_id' => $car->id,
        'source' => 'single_car',
    ];

    $response = $this->postJson('/api/v1/inquiries', $payload);

    $response->assertStatus(201);
    $response->assertJsonStructure(['data' => ['id', 'received_at']]);

    $row = Inquiry::firstOrFail();
    expect($row->name)->toBe('Jane Doe');
    expect($row->email)->toBe('jane@example.com');
    expect($row->car_id)->toBe($car->id);
    expect($row->source)->toBe('single_car');
    expect($row->status)->toBe('new');
    expect($row->ip_address)->not->toBeNull();
});

it('returns 422 with a structured errors object when email is missing', function () {
    $response = $this->postJson('/api/v1/inquiries', [
        'name' => 'Jane Doe',
        'message' => 'Hello',
        'source' => 'contact_page',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['message', 'errors' => ['email']]);
});

it('returns 422 when source is not in the allowed list', function () {
    $response = $this->postJson('/api/v1/inquiries', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'Hello',
        'source' => 'bogus_source',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['source']);
});

it('returns 422 when car_id does not exist', function () {
    $response = $this->postJson('/api/v1/inquiries', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'Hello',
        'source' => 'single_car',
        'car_id' => 99999,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['car_id']);
});

it('queues the admin notification and the customer confirmation on success', function () {
    $car = Car::factory()->create();

    $payload = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'Interested in this Land Cruiser.',
        'car_id' => $car->id,
        'source' => 'single_car',
    ];

    $this->postJson('/api/v1/inquiries', $payload)->assertStatus(201);

    $inquiry = Inquiry::firstOrFail();

    Mail::assertQueued(NewInquiryNotification::class, function ($mail) use ($inquiry) {
        return $mail->inquiry->is($inquiry);
    });
    Mail::assertQueued(CustomerInquiryConfirmation::class, function ($mail) use ($inquiry) {
        return $mail->hasTo('jane@example.com')
            && $mail->inquiry->is($inquiry);
    });
});

it('does not queue mail when validation fails', function () {
    $this->postJson('/api/v1/inquiries', ['source' => 'single_car'])->assertStatus(422);

    Mail::assertNothingQueued();
});

it('returns 429 after the 11th request from the same IP within a minute', function () {
    $payload = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'Repeat inquiry',
        'source' => 'contact_page',
    ];

    for ($i = 1; $i <= 10; $i++) {
        $this->postJson('/api/v1/inquiries', $payload)->assertStatus(201);
    }

    $this->postJson('/api/v1/inquiries', $payload)->assertStatus(429);
});
