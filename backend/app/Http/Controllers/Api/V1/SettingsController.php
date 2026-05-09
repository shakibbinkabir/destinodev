<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SettingsController extends ApiController
{
    private const CACHE_KEY = 'api:settings:flat';
    private const CACHE_TTL_SECONDS = 300;

    public function index(): JsonResponse
    {
        $flat = Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function (): array {
            $rows = Setting::query()->orderBy('key')->get(['key', 'value', 'type']);

            $out = [];
            foreach ($rows as $row) {
                $out[$row->key] = $this->coerce($row->value, $row->type);
            }

            return $out;
        });

        return response()->json(['data' => $flat]);
    }

    private function coerce(?string $value, ?string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'int' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}
