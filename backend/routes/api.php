<?php

use App\Http\Controllers\Api\V1\CarsController;
use App\Http\Controllers\Api\V1\DeliveredCarsController;
use App\Http\Controllers\Api\V1\ExchangeRateController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\HeroSlidesController;
use App\Http\Controllers\Api\V1\InquiriesController;
use App\Http\Controllers\Api\V1\LookupsController;
use App\Http\Controllers\Api\V1\PageContentsController;
use App\Http\Controllers\Api\V1\PartnersController;
use App\Http\Controllers\Api\V1\ProcessStepsController;
use App\Http\Controllers\Api\V1\ReviewsController;
use App\Http\Controllers\Api\V1\ServicesController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\ShippingPdfController;
use App\Http\Controllers\Api\V1\TestimonialsController;
use App\Http\Controllers\Api\V1\YoutubeFeedController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public REST API (Stage 3, PRD §8)
|--------------------------------------------------------------------------
|
| All endpoints live under /api/v1. Default throttle is 60 requests / minute
| / IP applied at the group level. POST /inquiries (10/min) and POST /reviews
| (5/min) override with stricter per-IP limits.
|
*/

Route::prefix('v1')->middleware('throttle:60,1')->group(function (): void {
    Route::get('/health', HealthController::class);

    // Cars
    Route::get('/cars', [CarsController::class, 'index']);
    Route::get('/cars/{id}', [CarsController::class, 'show'])->whereNumber('id');
    Route::get('/cars/{id}/similar', [CarsController::class, 'similar'])->whereNumber('id');

    // Delivered cars
    Route::get('/delivered-cars', [DeliveredCarsController::class, 'index']);

    // Testimonials (read-only)
    Route::get('/testimonials', [TestimonialsController::class, 'index']);

    // Site & content
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::get('/page/{slug}', [PageContentsController::class, 'show']);
    Route::get('/makes', [LookupsController::class, 'makes']);
    Route::get('/body-types', [LookupsController::class, 'bodyTypes']);
    Route::get('/hero-slides', [HeroSlidesController::class, 'index']);
    Route::get('/partners', [PartnersController::class, 'index']);
    Route::get('/services', [ServicesController::class, 'index']);
    Route::get('/process-steps', [ProcessStepsController::class, 'index']);

    // Live data — Stage 4 stubs (return 503 until wired)
    Route::get('/exchange-rate', ExchangeRateController::class);
    Route::get('/youtube-feed', YoutubeFeedController::class);
    Route::get('/shipping-pdf', ShippingPdfController::class);
});

// Public writes — stricter throttles per PRD §3.2 of Stage 3 task list.
Route::prefix('v1')->group(function (): void {
    Route::post('/inquiries', [InquiriesController::class, 'store'])
        ->middleware('throttle:10,1');

    Route::post('/reviews', [ReviewsController::class, 'store'])
        ->middleware('throttle:5,1');
});
