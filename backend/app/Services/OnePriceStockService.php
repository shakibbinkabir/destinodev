<?php

namespace App\Services;

use Generator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * JDMAuction OnePrice stock API client (PRD §6.4.3 + §15.1).
 *
 * Two endpoints, both GET:
 *   - {base_url}/search-auction   — list lots by maker + model + optional filters
 *   - {base_url}/lot-detail       — one lot by (id, bid)
 *
 * Auth: two custom headers, `username` and `api-key`. Not bearer.
 *
 * The search endpoint returns a wrapped envelope:
 *
 *   {
 *     "status": "SUCCESS" | "ERROR",
 *     "code":   200 | 4xx,
 *     "message": string,
 *     "auctionData": [ item, ... ] | null,
 *     "totalResults": int | null,
 *     "currentPage":  int | null,   // 0-indexed even though the request is 1-indexed
 *     "totalPages":   int | null
 *   }
 *
 * Each item carries auction-house provenance plus the actual car attributes:
 *
 *   id, bid, auctRef, auctionSystem, auctionHouse, datetime, isOnePrice,
 *   companyEn, companyRef, modelNameEn, modelNameRef, modelYearEn,
 *   modelGradeEn, modelTypeEn, mileageNum, transmissionEn, awdNum,
 *   displacement, displacementNum, startPriceNum, colorEn, colorRef,
 *   scoresEn, result, jdmPictures (string of urls joined by '#'),
 *   searchImg, parsedDataEn (CDATA-wrapped JSON of free-text fields)
 *
 * The `result` field distinguishes "Available" stock from sold/expired lots.
 */
class OnePriceStockService
{
    /**
     * Walk the search-auction endpoint for one (maker, model) pair, yielding
     * normalized items across all pages.
     *
     * @param  list<int|string>  $modelRefs  car_model.model_name_ref values
     * @param  array<string, mixed>  $filters  Optional: fromYear, toYear, chassisCode (csv),
     *                                         minM, maxM, color (csv), score (csv).
     *
     * @return Generator<int, array{
     *     car: array<string, mixed>,
     *     images: list<string>,
     *     raw: array<string, mixed>
     * }>
     */
    public function iterateLots(int $makerId, array $modelRefs, array $filters = []): Generator
    {
        $page = 1;

        while (true) {
            $body = $this->searchAuction($makerId, $modelRefs, $filters + ['page' => $page]);

            $items = $body['auctionData'] ?? null;
            if (! is_array($items) || $items === []) {
                return;
            }

            foreach ($items as $item) {
                if (! is_array($item)) {
                    continue;
                }
                yield $this->normalize($item);
            }

            // currentPage is 0-indexed even though `page` was 1-indexed on the request.
            $current = (int) ($body['currentPage'] ?? ($page - 1));
            $total = (int) ($body['totalPages'] ?? 0);
            if ($total <= 0 || $current + 1 >= $total) {
                return;
            }

            $page++;
        }
    }

    /**
     * @param  list<int|string>  $modelRefs
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function searchAuction(int $makerId, array $modelRefs, array $filters = []): array
    {
        if ($makerId <= 0 || $modelRefs === []) {
            throw new RuntimeException('search-auction requires maker + at least one model ref.');
        }

        $query = array_filter([
            'maker' => $makerId,
            'model' => implode(',', $modelRefs),
            'page' => $filters['page'] ?? null,
            'fromYear' => $filters['fromYear'] ?? null,
            'toYear' => $filters['toYear'] ?? null,
            'minM' => $filters['minM'] ?? null,
            'maxM' => $filters['maxM'] ?? null,
            'chassisCode' => $filters['chassisCode'] ?? null,
            'color' => $filters['color'] ?? null,
            'score' => $filters['score'] ?? null,
            'serDt' => $filters['serDt'] ?? null,
        ], static fn ($v) => $v !== null && $v !== '');

        return $this->request($this->endpoint('search-auction'), $query);
    }

    /**
     * @return array<string, mixed>
     */
    public function lotDetail(string $id, string $bid): array
    {
        if ($id === '' || $bid === '') {
            throw new RuntimeException('lot-detail requires both id and bid.');
        }

        return $this->request($this->endpoint('lot-detail'), ['id' => $id, 'bid' => $bid]);
    }

    /**
     * Normalize one raw item into the cars/car_images shape (PRD §7.1).
     *
     * Fallbacks intentionally cover the schema's NOT NULL constraints — the
     * vendor omits e.g. fuel/body_type/doors, so the seeder has to choose
     * sensible defaults rather than fail the upsert.
     *
     * @param  array<string, mixed>  $item
     * @return array{car: array<string, mixed>, images: list<string>, raw: array<string, mixed>}
     */
    public function normalize(array $item): array
    {
        $externalId = (string) ($item['id'] ?? '');
        if ($externalId === '') {
            throw new RuntimeException('OnePrice item is missing `id`.');
        }

        $bid = isset($item['bid']) ? (string) $item['bid'] : '';

        $images = $this->splitPictures((string) ($item['jdmPictures'] ?? ''));
        if ($images === [] && isset($item['searchImg']) && is_string($item['searchImg']) && $item['searchImg'] !== '') {
            $images = [$item['searchImg']];
        }

        $year = (int) ($item['modelYearEn'] ?? 0);
        $mileageRaw = $item['mileageNum'] ?? 0;
        // The vendor reports mileage in thousand-km units (e.g. "91" = 91,000 km).
        $mileageKm = (int) round(((float) $mileageRaw) * 1000);

        $make = $this->titleCase((string) ($item['companyEn'] ?? ''));
        $model = $this->titleCase((string) ($item['modelNameEn'] ?? ''));
        $chassis = trim((string) ($item['modelTypeEn'] ?? '')) ?: null;
        $grade = trim((string) ($item['modelGradeEn'] ?? ''));

        $fuel = $this->inferFuel($grade, $model, (string) ($item['displacement'] ?? ''));
        $transmission = $this->inferTransmission((string) ($item['transmissionEn'] ?? ''));
        $drive = $this->inferDrive((string) ($item['awdNum'] ?? '0'));
        $bodyType = $this->inferBodyType((string) ($item['parsedDataEn'] ?? ''));
        [$seats, $doors] = $this->inferSeatsDoors($bodyType);
        $engineSize = $this->formatEngineSize($item['displacementNum'] ?? $item['displacement'] ?? null);
        $condition = $this->inferCondition((string) ($item['scoresEn'] ?? ''));

        $status = strcasecmp((string) ($item['result'] ?? 'Available'), 'Available') === 0
            ? 'available'
            : 'sold';

        $price = (float) ($item['startPriceNum'] ?? 0);

        $description = $this->buildDescription($item, $grade);

        return [
            'car' => [
                'external_id' => $externalId,
                'lot_bid' => $bid !== '' ? $bid : null,
                'chassis_code' => $chassis,
                'auction_house' => (string) ($item['auctionHouse'] ?? '') ?: null,
                'auction_grade' => ($item['scoresEn'] ?? '') !== '' ? (string) $item['scoresEn'] : null,
                'make' => $make !== '' ? $make : 'Unknown',
                'model' => $model !== '' ? $model : 'Unknown',
                'year' => $year > 0 ? $year : (int) date('Y'),
                'price_jpy' => $price,
                'mileage_km' => $mileageKm,
                'fuel' => $fuel,
                'transmission' => $transmission,
                'body_type' => $bodyType,
                'engine_size' => $engineSize,
                'color' => $this->titleCase((string) ($item['colorEn'] ?? 'Unknown')),
                'drive_type' => $drive,
                'seats' => $seats,
                'doors' => $doors,
                'condition' => $condition,
                'source' => 'api',
                'status' => $status,
                'description' => $description,
            ],
            'images' => $images,
            'raw' => $item,
        ];
    }

    /**
     * @return list<string>
     */
    protected function splitPictures(string $raw): array
    {
        if ($raw === '') {
            return [];
        }

        $parts = array_map('trim', explode('#', $raw));
        $urls = array_values(array_filter(
            $parts,
            static fn (string $u) => $u !== '' && (str_starts_with($u, 'http://') || str_starts_with($u, 'https://')),
        ));

        // Vendor convention: `number=0` is the auction inspection schematic
        // (line-drawn condition diagram), `number=1+` are real photographs.
        // Their own `searchImg` field always points to `number=1`, confirming
        // this. Push any sheet URLs to the end so the public gallery leads
        // with photos and the schematic shows up last.
        $sheets = [];
        $photos = [];
        foreach ($urls as $u) {
            if (preg_match('/[?&]number=0(?:&|$)/', $u)) {
                $sheets[] = $u;
            } else {
                $photos[] = $u;
            }
        }

        return array_merge($photos, $sheets);
    }

    protected function titleCase(string $raw): string
    {
        $raw = trim($raw);
        if ($raw === '') {
            return '';
        }

        // The vendor returns these in ALL CAPS. ucwords on a lowercased string
        // produces "Toyota", "Pearl White", etc.
        return ucwords(strtolower($raw));
    }

    protected function inferFuel(string $grade, string $model, string $displacement): string
    {
        $needle = strtoupper($grade.' '.$model);

        // Model-name signals for well-known hybrids/EVs that don't always tag
        // the grade string with HYBRID/EV. Add new nameplates here when the
        // catalog grows.
        $hybridModels = ['PRIUS', 'AQUA', 'CROWN HYBRID', 'INSIGHT', 'MIRAI'];
        $evModels = ['LEAF', 'BZ4X', 'ARIYA', 'IX', 'EQS', 'IONIQ'];

        foreach ($hybridModels as $kw) {
            if (str_contains($needle, $kw)) {
                return 'hybrid';
            }
        }
        if (str_contains($needle, 'HYBRID') || str_contains($needle, 'PHEV')) {
            return 'hybrid';
        }
        foreach ($evModels as $kw) {
            if (str_contains($needle, $kw)) {
                return 'ev';
            }
        }
        if (str_contains($needle, 'ELECTRIC') || (str_contains($needle, ' EV ') || str_ends_with(rtrim($needle), ' EV'))) {
            return 'ev';
        }
        if (str_contains($needle, 'DIESEL') || str_contains($needle, 'CDX') || str_contains($needle, 'TDI')) {
            return 'diesel';
        }
        // Empty displacement on a passenger car would be unusual; fall through to gasoline.

        return 'gasoline';
    }

    protected function inferTransmission(string $raw): string
    {
        $code = strtoupper(trim($raw));

        if ($code === '' || $code === 'IAT' || $code === 'AT' || $code === 'AAT') {
            return 'automatic';
        }
        if (str_contains($code, 'CVT')) {
            return 'cvt';
        }
        if ($code === 'MT' || $code === 'IMT') {
            return 'manual';
        }

        return 'automatic';
    }

    protected function inferDrive(string $awd): string
    {
        return trim($awd) === '1' ? '4wd' : '2wd';
    }

    protected function inferBodyType(string $parsedData): string
    {
        // parsedDataEn is `<![CDATA[{...}]]>` containing free-text Japanese-derived
        // labels. We do a cheap keyword match for the most common forms.
        $needle = strtolower($parsedData);

        return match (true) {
            str_contains($needle, 'suv') => 'SUV',
            str_contains($needle, 'wagon') => 'Wagon',
            str_contains($needle, 'truck') => 'Truck',
            str_contains($needle, 'van') => 'Van',
            str_contains($needle, 'coupe') => 'Coupe',
            str_contains($needle, 'hatchback') => 'Hatchback',
            str_contains($needle, 'convertible') => 'Convertible',
            str_contains($needle, 'minivan') => 'Minivan',
            default => 'Sedan',
        };
    }

    /**
     * @return array{0:int,1:int}
     */
    protected function inferSeatsDoors(string $bodyType): array
    {
        return match ($bodyType) {
            'SUV' => [7, 5],
            'Minivan', 'Van' => [8, 5],
            'Wagon', 'Hatchback' => [5, 5],
            'Coupe', 'Convertible' => [4, 2],
            'Truck' => [3, 2],
            default => [5, 4],
        };
    }

    protected function formatEngineSize(mixed $cc): ?string
    {
        if ($cc === null || $cc === '' || $cc === 0 || $cc === '0') {
            return null;
        }
        $cc = (int) $cc;
        if ($cc <= 0) {
            return null;
        }

        $litres = $cc / 1000;

        return rtrim(rtrim(number_format($litres, 1), '0'), '.').'L';
    }

    protected function inferCondition(string $score): string
    {
        $s = strtoupper(trim($score));

        return match (true) {
            $s === 'S' || $s === '6' || $s === '5.5' => 'Excellent',
            $s === '5' || $s === '4.5' => 'Very Good',
            $s === '4' => 'Good',
            $s === '3.5' || $s === '3' => 'Fair',
            $s === '' => 'Good',
            default => 'Good',
        };
    }

    /**
     * @param  array<string, mixed>  $item
     */
    protected function buildDescription(array $item, string $grade): string
    {
        $bits = [];
        if ($grade !== '') {
            $bits[] = 'Grade: '.$grade;
        }
        if (! empty($item['scoresEn'])) {
            $bits[] = 'Auction score: '.$item['scoresEn'];
        }
        if (! empty($item['auctionHouse'])) {
            $bits[] = 'Source: '.$item['auctionHouse'];
        }
        if (! empty($item['equipmentEn']) && trim((string) $item['equipmentEn']) !== '') {
            $bits[] = 'Equipment: '.$item['equipmentEn'];
        }

        return implode(' · ', $bits);
    }

    protected function endpoint(string $path): string
    {
        $base = rtrim((string) config('services.one_price_stock.base_url', ''), '/');
        if ($base === '') {
            throw new RuntimeException('services.one_price_stock.base_url is not configured.');
        }

        return $base.'/'.ltrim($path, '/');
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    protected function request(string $url, array $query): array
    {
        $username = (string) config('services.one_price_stock.username', '');
        $apiKey = (string) config('services.one_price_stock.key', '');

        if (
            $username === '' || str_starts_with($username, 'CHANGE_ME')
            || $apiKey === '' || str_starts_with($apiKey, 'CHANGE_ME')
        ) {
            throw new RuntimeException('One-Price Stock API credentials are not configured.');
        }

        try {
            $response = $this->client($username, $apiKey)->timeout(45)->get($url, $query);
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

        // Vendor surfaces application-level errors with a 2xx-then-ERROR pattern only
        // in some cases; in practice they return real HTTP status codes. Defensive:
        $status = $body['status'] ?? null;
        if ($status === 'ERROR') {
            throw new RuntimeException('one-price-stock error: '.($body['message'] ?? 'unknown'));
        }

        return $body;
    }

    protected function client(string $username, string $apiKey): PendingRequest
    {
        return Http::acceptJson()->withHeaders([
            'username' => $username,
            'api-key' => $apiKey,
        ]);
    }
}
