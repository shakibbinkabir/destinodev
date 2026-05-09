<?php

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('returns 404 when no shipping page exists', function () {
    $this->getJson('/api/v1/shipping-pdf')
        ->assertStatus(404)
        ->assertJson(['message' => 'Shipping information PDF not available.']);
});

it('returns 404 when the shipping page has no PDF uploaded', function () {
    PageContent::factory()->create([
        'slug' => 'shipping',
        'title' => 'Shipping',
        'extras' => null,
    ]);

    $this->getJson('/api/v1/shipping-pdf')
        ->assertStatus(404)
        ->assertJson(['message' => 'Shipping information PDF not available.']);
});

it('redirects 302 to the storage URL when a PDF is uploaded', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('shipping.pdf', 100, 'application/pdf');
    $path = $file->store('shipping', 'public');

    PageContent::factory()->create([
        'slug' => 'shipping',
        'title' => 'Shipping',
        'extras' => ['shipping_pdf_path' => $path],
    ]);

    $response = $this->get('/api/v1/shipping-pdf');

    $response->assertStatus(302);
    expect($response->headers->get('Location'))->toContain($path);
});

it('returns 404 when the path points to a missing file', function () {
    PageContent::factory()->create([
        'slug' => 'shipping',
        'title' => 'Shipping',
        'extras' => ['shipping_pdf_path' => 'shipping/missing.pdf'],
    ]);

    $this->getJson('/api/v1/shipping-pdf')->assertStatus(404);
});
