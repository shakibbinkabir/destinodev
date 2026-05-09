<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduler (PRD §3 + §6.4.3 + §6.4.7)
|--------------------------------------------------------------------------
|
| Hostinger fires `php artisan schedule:run` every minute via cron. The
| schedule runs:
|
|   - stock:sync hourly: re-syncs the One-Price Stock catalog. Skips
|     gracefully when credentials are CHANGE_ME placeholders.
|   - queue:work --stop-when-empty every minute: drains the database queue
|     used by inquiry/review mailables. --stop-when-empty avoids the need
|     for a long-running supervisor process on shared hosting.
|
*/

Schedule::command('stock:sync')
    ->hourly()
    ->withoutOverlapping()
    ->onFailure(function (): void {
        Log::error('Scheduled stock:sync run failed — see prior log entries for the upstream error.');
    });

Schedule::command('queue:work --stop-when-empty --tries=3')
    ->everyMinute()
    ->withoutOverlapping();
