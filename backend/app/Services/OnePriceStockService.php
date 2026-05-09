<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Wrapper around the One-Price Stock external listings API (PRD §6.4.3 + §15).
 *
 * The vendor has not yet supplied API documentation as of 2026-05-09. This
 * class is implemented against a STUB shape so the rest of Stage 4 can land:
 *
 *   {
 *     "id":               string  // becomes cars.external_id
 *     "make":             string,
 *     "model":            string,
 *     "year":             int,
 *     "price_jpy":        number,
 *     "mileage_km":       int,
 *     "fuel":             string  // gasoline | hybrid | ev | diesel
 *     "transmission":     string  // automatic | manual | cvt
 *     "body_type":        string,
 *     "color":            string,
 *     "drive_type":       string  // 2wd | 4wd | awd | fwd | rwd
 *     "engine_size":      string?,
 *     "seats":            int,
 *     "doors":            int,
 *     "description":      string,
 *     "image_urls":       string[]
 *   }
 *
 * The shape above mirrors PRD §7.1 column names so normalize() is a thin
 * pass-through. When the real shape arrives, update normalize() and the
 * BLOCKERS.md entry simultaneously — do NOT edit the schema to fit the API.
 *
 * Auth assumption: bearer token in `Authorization` header. Rate-limit
 * assumption: none communicated. Pagination assumption: response is either
 * a flat list or wraps it under `data`/`items`/`results` — we accept all.
 *
 * The command layer ({@see \App\Console\Commands\StockSync}) is responsible
 * for credential gating and graceful no-op behavior; this service throws on
 * any I/O failure and lets the caller decide how to log/exit.
 */
class OnePriceStockService
{
    /**
     * @return list<array<string, mixed>>
     */
    public function fetchAllListings(): array
    {
        $url = (string) config('services.one_price_stock.url', '');
        $key = (string) config('services.one_price_stock.key', '');

        if ($url === '' || str_starts_with($url, 'CHANGE_ME')
            || $key === '' || str_starts_with($key, 'CHANGE_ME')) {
            throw new RuntimeException('One-Price Stock API credentials are not configured.');
        }

        try {
            $response = $this->client($key)->timeout(30)->get($url);
        } catch (ConnectionException $e) {
            throw new RuntimeException('one-price-stock connection failed: '.$e->getMessage(), previous: $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException('one-price-stock non-2xx response: '.$response->status());
        }

        $body = $response->json();
        if (! is_array($body)) {
            throw new RuntimeException('one-price-stock response is not JSON.');
        }

        // Accept either a bare list or a list wrapped under data/items/results.
        $list = $body;
        foreach (['data', 'items', 'results'] as $envelope) {
            if (isset($body[$envelope]) && is_array($body[$envelope])) {
                $list = $body[$envelope];
                break;
            }
        }

        if (! array_is_list($list)) {
            throw new RuntimeException('one-price-stock response did not contain a list of items.');
        }

        return array_values($list);
    }

    /**
     * Normalize a single API item into the cars/car_images schema (PRD §7.1).
     *
     * @param  array<string, mixed>  $item
     * @return array{
     *     car: array<string, mixed>,
     *     images: list<string>
     * }
     */
    public function normalize(array $item): array
    {
        $externalId = (string) ($item['id'] ?? $item['external_id'] ?? '');
        if ($externalId === '') {
            throw new RuntimeException('one-price-stock item is missing an id.');
        }

        $images = $item['image_urls'] ?? $item['images'] ?? [];
        if (! is_array($images)) {
            $images = [];
        }
        $images = array_values(array_filter(array_map(
            static fn ($url) => is_string($url) ? trim($url) : null,
            $images,
        )));

        return [
            'car' => [
                'external_id' => $externalId,
                'make' => (string) ($item['make'] ?? ''),
                'model' => (string) ($item['model'] ?? ''),
                'year' => (int) ($item['year'] ?? 0),
                'price_jpy' => (float) ($item['price_jpy'] ?? 0),
                'mileage_km' => (int) ($item['mileage_km'] ?? 0),
                'fuel' => $this->normalizeEnum($item['fuel'] ?? 'gasoline', ['gasoline', 'hybrid', 'ev', 'diesel'], 'gasoline'),
                'transmission' => $this->normalizeEnum($item['transmission'] ?? 'automatic', ['automatic', 'manual', 'cvt'], 'automatic'),
                'body_type' => (string) ($item['body_type'] ?? 'Sedan'),
                'engine_size' => isset($item['engine_size']) ? (string) $item['engine_size'] : null,
                'color' => (string) ($item['color'] ?? 'Unknown'),
                'drive_type' => $this->normalizeEnum($item['drive_type'] ?? '2wd', ['2wd', '4wd', 'awd', 'fwd', 'rwd'], '2wd'),
                'seats' => (int) ($item['seats'] ?? 5),
                'doors' => (int) ($item['doors'] ?? 4),
                'condition' => (string) ($item['condition'] ?? 'Good'),
                'battery_capacity' => isset($item['battery_capacity']) ? (string) $item['battery_capacity'] : null,
                'motor_output' => isset($item['motor_output']) ? (string) $item['motor_output'] : null,
                'description' => (string) ($item['description'] ?? ''),
                'source' => 'api',
                'status' => 'available',
            ],
            'images' => $images,
        ];
    }

    protected function client(string $key): PendingRequest
    {
        return Http::withToken($key)->acceptJson();
    }

    /**
     * @param  list<string>  $allowed
     */
    protected function normalizeEnum(mixed $value, array $allowed, string $fallback): string
    {
        if (! is_string($value)) {
            return $fallback;
        }

        $normalized = strtolower(trim($value));

        return in_array($normalized, $allowed, true) ? $normalized : $fallback;
    }
}
