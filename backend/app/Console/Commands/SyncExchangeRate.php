<?php

namespace App\Console\Commands;

use App\Services\ExchangeRateService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Refresh the cached USD→JPY rate from MUFG (PRD §6.4.4, client-overridden).
 *
 * Scheduled every 3 hours in routes/console.php. Forces a fresh fetch and
 * repopulates the cache + last-known keys. Exits SUCCESS even on upstream
 * failure: MUFG publishes "----" (unconfirmed) outside its update windows, so
 * a failed refresh must not be treated as a fatal error — the last-known value
 * keeps serving until the next confirmed publication.
 */
class SyncExchangeRate extends Command
{
    protected $signature = 'exchange-rate:sync';

    protected $description = 'Refresh the cached USD→JPY rate from MUFG (T.T.B. − offset).';

    public function handle(ExchangeRateService $service): int
    {
        try {
            $payload = $service->refresh();
        } catch (RuntimeException $e) {
            Log::warning('exchange-rate:sync could not refresh; keeping last-known value.', [
                'reason' => $e->getMessage(),
            ]);
            $this->warn('Exchange rate not refreshed (upstream unconfirmed or unavailable): '.$e->getMessage());

            return self::SUCCESS;
        }

        $this->info("Exchange rate refreshed: 1 USD = ¥{$payload['rate']} (fetched {$payload['fetched_at']}).");

        return self::SUCCESS;
    }
}
