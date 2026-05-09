<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\PageContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

/**
 * Shipping PDF redirector (PRD §6.4.6 / §8.8).
 *
 * Reads `extras.shipping_pdf_path` from the page_contents row keyed
 * `slug='shipping'`. If present, redirects 302 to the public-disk URL.
 * If absent, returns 404 with a friendly message so the frontend can
 * fall back to its placeholder copy.
 */
class ShippingPdfController extends ApiController
{
    public function __invoke(): RedirectResponse|JsonResponse
    {
        $page = PageContent::query()->where('slug', 'shipping')->first();
        $path = is_array($page?->extras) ? ($page->extras['shipping_pdf_path'] ?? null) : null;

        if (is_string($path) && $path !== '' && Storage::disk('public')->exists($path)) {
            return redirect(Storage::disk('public')->url($path), 302);
        }

        return response()->json([
            'message' => 'Shipping information PDF not available.',
        ], 404);
    }
}
