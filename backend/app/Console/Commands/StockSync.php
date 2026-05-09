<?php

namespace App\Console\Commands;

use App\Models\Car;
use App\Models\CarImage;
use App\Services\OnePriceStockService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Hourly One-Price Stock catalog sync (PRD §6.4.3).
 *
 * Behaviour:
 *   - Missing or CHANGE_ME credentials → log warning, exit 0 (no-op so the
 *     scheduler does not spam errors during the wait for vendor access).
 *   - HTTP/parse failure → log error, exit non-zero, leave the DB untouched
 *     (no transaction is started).
 *   - Success → wrap upsert + sold-marking in a single DB transaction so a
 *     partial failure rolls back the whole sync.
 *
 * Empty-response sentinel: if fetchAllListings() returns zero items we
 * abort without touching the catalog, on the assumption that an upstream
 * blip is more likely than a legitimately empty inventory. The vendor's
 * documented behavior for "no listings" should override this once known.
 */
class StockSync extends Command
{
    protected $signature = 'stock:sync';

    protected $description = 'Pull the latest listings from the One-Price Stock API and reconcile the local cars/car_images catalog.';

    public function handle(OnePriceStockService $service): int
    {
        try {
            $items = $service->fetchAllListings();
        } catch (RuntimeException $e) {
            $message = $e->getMessage();

            if (str_contains($message, 'credentials are not configured')) {
                Log::warning('stock:sync skipped — One-Price Stock credentials not configured.');
                $this->warn('One-Price Stock API credentials are not configured — skipping. Set ONE_PRICE_STOCK_API_URL and ONE_PRICE_STOCK_API_KEY in .env to enable.');
                return self::SUCCESS;
            }

            Log::error('stock:sync upstream fetch failed.', ['reason' => $message]);
            $this->error("Sync failed: {$message}");
            return self::FAILURE;
        } catch (Throwable $e) {
            Log::error('stock:sync unexpected error during fetch.', [
                'reason' => $e->getMessage(),
                'class' => $e::class,
            ]);
            $this->error('Unexpected error during fetch — see laravel.log.');
            return self::FAILURE;
        }

        if ($items === []) {
            Log::warning('stock:sync received an empty list — treating as upstream blip and aborting.');
            $this->warn('Upstream returned zero items. Aborting without changes.');
            return self::FAILURE;
        }

        $stats = [
            'fetched' => count($items),
            'created' => 0,
            'updated' => 0,
            'marked_sold' => 0,
            'errors' => 0,
        ];

        try {
            DB::transaction(function () use ($items, $service, &$stats): void {
                $seen = [];

                foreach ($items as $item) {
                    try {
                        $payload = $service->normalize($item);
                        $external = $payload['car']['external_id'];
                        $car = Car::withTrashed()->where('external_id', $external)->first();

                        if ($car === null) {
                            $car = Car::create($payload['car']);
                            $stats['created']++;
                        } else {
                            $car->fill($payload['car']);
                            if ($car->trashed()) {
                                $car->restore();
                            }
                            if ($car->isDirty()) {
                                $car->save();
                                $stats['updated']++;
                            }
                        }

                        $seen[] = $external;
                        $this->replaceImages($car->id, $payload['images']);
                    } catch (Throwable $e) {
                        $stats['errors']++;
                        Log::warning('stock:sync item failed.', [
                            'external_id' => $item['id'] ?? null,
                            'reason' => $e->getMessage(),
                        ]);
                    }
                }

                $stats['marked_sold'] = Car::query()
                    ->where('source', 'api')
                    ->where('status', '!=', 'sold')
                    ->whereNotIn('external_id', array_values(array_unique(array_filter($seen))))
                    ->update(['status' => 'sold']);
            });
        } catch (Throwable $e) {
            Log::error('stock:sync transaction failed — DB unchanged.', ['reason' => $e->getMessage()]);
            $this->error('Sync transaction failed: '.$e->getMessage());
            return self::FAILURE;
        }

        Log::info('stock:sync completed.', $stats);
        $this->info(sprintf(
            'fetched=%d created=%d updated=%d marked_sold=%d errors=%d',
            $stats['fetched'],
            $stats['created'],
            $stats['updated'],
            $stats['marked_sold'],
            $stats['errors'],
        ));

        return self::SUCCESS;
    }

    /**
     * @param  list<string>  $imageUrls
     */
    protected function replaceImages(int $carId, array $imageUrls): void
    {
        CarImage::where('car_id', $carId)->delete();

        foreach (array_values($imageUrls) as $index => $url) {
            CarImage::create([
                'car_id' => $carId,
                'path' => $url,
                'sort_order' => $index,
                'is_primary' => $index === 0,
            ]);
        }
    }
}
