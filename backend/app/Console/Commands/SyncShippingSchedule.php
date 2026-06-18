<?php

namespace App\Console\Commands;

use App\Services\ShippingScheduleService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Refresh the cached RoRo shipping-schedule directory from the source page.
 *
 * Scheduled daily in routes/console.php. Forces a fresh scrape and repopulates
 * the cache + last-known keys. Exits SUCCESS even on upstream failure: a flaky
 * third-party page must not be treated as fatal — the last-known value keeps
 * serving until the next successful scrape.
 */
class SyncShippingSchedule extends Command
{
    protected $signature = 'shipping-schedule:sync';

    protected $description = 'Refresh the cached RoRo shipping-schedule directory from the source page.';

    public function handle(ShippingScheduleService $service): int
    {
        try {
            $payload = $service->refresh();
        } catch (RuntimeException $e) {
            Log::warning('shipping-schedule:sync could not refresh; keeping last-known value.', [
                'reason' => $e->getMessage(),
            ]);
            $this->warn('Shipping schedule not refreshed (upstream unavailable): '.$e->getMessage());

            return self::SUCCESS;
        }

        $regions = count($payload['regions']);
        $carriers = array_sum(array_map(fn ($r) => count($r['carriers']), $payload['regions']));
        $this->info("Shipping schedule refreshed: {$regions} regions, {$carriers} carrier rows (fetched {$payload['fetched_at']}).");

        return self::SUCCESS;
    }
}
