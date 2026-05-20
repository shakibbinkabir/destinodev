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
 * JDMAuction OnePrice stock sync (PRD §6.4.3).
 *
 * The vendor API only supports per-(maker, model) queries — there is no
 * "fetch all" endpoint. This command therefore iterates a maker allowlist
 * (env `ONE_PRICE_STOCK_MAKERS`, CSV of maker company_ids) crossed with the
 * vendor's reference list of model_name_refs for each maker (loaded from
 * the JSON dumps under database/data/oneprice/).
 *
 * CLI overrides for ad-hoc runs:
 *   --maker=9                 only this maker (overrides env allowlist)
 *   --model=718,827           only these model_name_refs (requires --maker)
 *   --limit-models=20         per-maker cap on how many models to walk
 *   --max-pages=3             per-(maker, model) cap on pagination depth
 *   --dry-run                 fetch + normalize + log, but write nothing
 *
 * Sold-marking is scoped to the (make, model) pairs visited this run — a
 * Toyota-only sync MUST NOT mark Honda API cars as sold. We track visited
 * (make, model) string pairs after normalization and diff per pair.
 *
 * Empty-page handling: if every visited pair returns zero items, that's
 * almost certainly an upstream blip rather than a legitimately-empty
 * catalog, so we abort without touching the DB.
 */
class StockSync extends Command
{
    protected $signature = 'stock:sync
        {--maker= : Restrict to a single maker company_id}
        {--model= : Restrict to a CSV of model_name_refs (requires --maker)}
        {--limit-models= : Per-maker cap on models walked (default: no cap)}
        {--max-pages=10 : Per-(maker, model) cap on pages walked}
        {--dry-run : Fetch and log without writing}';

    protected $description = 'Pull JDMAuction OnePrice lots and reconcile the local cars/car_images catalog.';

    public function handle(OnePriceStockService $service): int
    {
        try {
            $plan = $this->buildPlan();
        } catch (RuntimeException $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }

        if ($plan === []) {
            $this->warn('No (maker, model) pairs to sync. Set ONE_PRICE_STOCK_MAKERS or pass --maker.');
            return self::SUCCESS;
        }

        $dryRun = (bool) $this->option('dry-run');
        $maxPages = (int) $this->option('max-pages') ?: 10;

        $stats = [
            'pairs' => count($plan),
            'fetched' => 0,
            'created' => 0,
            'updated' => 0,
            'marked_sold' => 0,
            'errors' => 0,
            'skipped_pairs' => 0,
        ];

        /** @var array<string, list<string>> visited[make|model] = [external_id, ...] */
        $visited = [];
        /** @var list<array{car: array<string, mixed>, images: list<string>, raw: array<string, mixed>}> */
        $normalized = [];

        foreach ($plan as $pair) {
            [$makerId, $makerName, $modelRefs] = $pair;
            $pairLabel = "{$makerName} (#{$makerId}) models=".count($modelRefs);

            try {
                $count = 0;
                $generator = $service->iterateLots($makerId, $modelRefs);
                $pages = 0;
                $lastSeenPage = -1;

                foreach ($generator as $item) {
                    $normalized[] = $item;
                    $count++;

                    $make = $item['car']['make'];
                    $model = $item['car']['model'];
                    $visited[$make.'|'.$model] ??= [];
                    $visited[$make.'|'.$model][] = $item['car']['external_id'];

                    // Approximate per-pair pagination cap: items typically come in
                    // batches of ~50/page, so we cut off after maxPages * 50.
                    if ($count >= $maxPages * 50) {
                        break;
                    }
                }

                $stats['fetched'] += $count;
                $this->info("[{$pairLabel}] fetched {$count}");
            } catch (RuntimeException $e) {
                $message = $e->getMessage();
                if (str_contains($message, 'credentials are not configured')) {
                    Log::warning('stock:sync skipped — One-Price Stock credentials not configured.');
                    $this->warn('Credentials missing — set ONE_PRICE_STOCK_API_USERNAME and ONE_PRICE_STOCK_API_KEY in .env.');
                    return self::SUCCESS;
                }
                $stats['skipped_pairs']++;
                $stats['errors']++;
                Log::warning('stock:sync pair failed.', ['pair' => $pairLabel, 'reason' => $message]);
                $this->warn("[{$pairLabel}] skipped: {$message}");
            } catch (Throwable $e) {
                $stats['skipped_pairs']++;
                $stats['errors']++;
                Log::warning('stock:sync pair unexpected error.', [
                    'pair' => $pairLabel,
                    'reason' => $e->getMessage(),
                    'class' => $e::class,
                ]);
                $this->warn("[{$pairLabel}] skipped: ".$e->getMessage());
            }
        }

        if ($normalized === []) {
            Log::warning('stock:sync returned zero items across all pairs — treating as upstream blip.');
            $this->warn('Upstream returned zero items across every pair. Aborting without changes.');
            return self::FAILURE;
        }

        if ($dryRun) {
            $this->info(sprintf(
                'dry-run: pairs=%d fetched=%d (would write) marked_sold=%d errors=%d',
                $stats['pairs'],
                $stats['fetched'],
                $this->countWouldBeSold($visited),
                $stats['errors'],
            ));
            return self::SUCCESS;
        }

        try {
            DB::transaction(function () use ($normalized, $visited, &$stats): void {
                foreach ($normalized as $item) {
                    try {
                        $car = Car::withTrashed()->where('external_id', $item['car']['external_id'])->first();

                        if ($car === null) {
                            $car = Car::create($item['car']);
                            $stats['created']++;
                        } else {
                            $car->fill($item['car']);
                            if ($car->trashed()) {
                                $car->restore();
                            }
                            if ($car->isDirty()) {
                                $car->save();
                                $stats['updated']++;
                            }
                        }

                        $this->replaceImages($car->id, $item['images']);
                    } catch (Throwable $e) {
                        $stats['errors']++;
                        Log::warning('stock:sync item failed.', [
                            'external_id' => $item['car']['external_id'] ?? null,
                            'reason' => $e->getMessage(),
                        ]);
                    }
                }

                foreach ($visited as $pair => $externals) {
                    [$make, $model] = explode('|', $pair, 2);
                    $unique = array_values(array_unique(array_filter($externals)));

                    $stats['marked_sold'] += Car::query()
                        ->where('source', 'api')
                        ->where('status', '!=', 'sold')
                        ->where('make', $make)
                        ->where('model', $model)
                        ->whereNotIn('external_id', $unique)
                        ->update(['status' => 'sold']);
                }
            });
        } catch (Throwable $e) {
            Log::error('stock:sync transaction failed — DB unchanged.', ['reason' => $e->getMessage()]);
            $this->error('Sync transaction failed: '.$e->getMessage());
            return self::FAILURE;
        }

        Log::info('stock:sync completed.', $stats);
        $this->info(sprintf(
            'pairs=%d fetched=%d created=%d updated=%d marked_sold=%d errors=%d',
            $stats['pairs'],
            $stats['fetched'],
            $stats['created'],
            $stats['updated'],
            $stats['marked_sold'],
            $stats['errors'],
        ));

        return self::SUCCESS;
    }

    /**
     * Build the iteration plan: list of [maker_id, maker_name, [model_name_ref, ...]].
     *
     * @return list<array{0:int,1:string,2:list<int>}>
     */
    protected function buildPlan(): array
    {
        $makers = $this->loadJson('makers.json');
        $models = $this->loadJson('car-models.json');

        $explicitMaker = $this->option('maker') !== null ? (int) $this->option('maker') : null;
        $explicitModels = $this->option('model');

        if ($explicitMaker !== null) {
            $maker = collect($makers)->firstWhere('company_id', $explicitMaker);
            if ($maker === null) {
                throw new RuntimeException("Unknown maker company_id={$explicitMaker} — check database/data/oneprice/makers.json.");
            }
            $name = (string) $maker['name'];

            if ($explicitModels !== null && $explicitModels !== '') {
                $refs = array_values(array_filter(array_map('intval', explode(',', $explicitModels))));
                if ($refs === []) {
                    throw new RuntimeException('--model produced no usable refs after parsing.');
                }
                return [[$explicitMaker, $name, $refs]];
            }

            $refs = $this->modelRefsFor($explicitMaker, $models);
            return [[$explicitMaker, $name, $this->capModels($refs)]];
        }

        if ($explicitModels !== null && $explicitModels !== '') {
            throw new RuntimeException('--model requires --maker.');
        }

        $allowlist = (string) config('services.one_price_stock.makers', '');
        $ids = array_values(array_filter(array_map('intval', explode(',', $allowlist))));
        if ($ids === []) {
            return [];
        }

        $plan = [];
        foreach ($ids as $id) {
            $maker = collect($makers)->firstWhere('company_id', $id);
            if ($maker === null) {
                $this->warn("Skipping unknown maker company_id={$id} from ONE_PRICE_STOCK_MAKERS.");
                continue;
            }
            $refs = $this->modelRefsFor($id, $models);
            if ($refs === []) {
                continue;
            }
            $plan[] = [$id, (string) $maker['name'], $this->capModels($refs)];
        }

        return $plan;
    }

    /**
     * Distinct model_name_refs for a given maker company_id.
     *
     * @param  list<array<string, mixed>>  $models
     * @return list<int>
     */
    protected function modelRefsFor(int $makerId, array $models): array
    {
        $needle = (string) $makerId;
        $refs = [];
        foreach ($models as $row) {
            if (! is_array($row)) {
                continue;
            }
            if ((string) ($row['company_ref'] ?? '') !== $needle) {
                continue;
            }
            $ref = (int) ($row['model_name_ref'] ?? 0);
            if ($ref > 0) {
                $refs[$ref] = true;
            }
        }

        return array_keys($refs);
    }

    /**
     * @param  list<int>  $refs
     * @return list<int>
     */
    protected function capModels(array $refs): array
    {
        $cap = $this->option('limit-models');
        if ($cap === null || (int) $cap <= 0) {
            return $refs;
        }

        return array_slice($refs, 0, (int) $cap);
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function loadJson(string $file): array
    {
        $path = database_path('data/oneprice/'.$file);
        if (! is_readable($path)) {
            throw new RuntimeException("Reference data missing: {$path}. Run scripts/build-oneprice-lookups.php.");
        }

        /** @var list<array<string, mixed>> $decoded */
        $decoded = json_decode((string) file_get_contents($path), true) ?? [];

        return $decoded;
    }

    /**
     * @param  array<string, list<string>>  $visited
     */
    protected function countWouldBeSold(array $visited): int
    {
        $total = 0;
        foreach ($visited as $pair => $externals) {
            [$make, $model] = explode('|', $pair, 2);
            $unique = array_values(array_unique(array_filter($externals)));
            $total += Car::query()
                ->where('source', 'api')
                ->where('status', '!=', 'sold')
                ->where('make', $make)
                ->where('model', $model)
                ->whereNotIn('external_id', $unique === [] ? [''] : $unique)
                ->count();
        }

        return $total;
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
