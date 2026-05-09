<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
    ];

    /**
     * Read a setting value by key. Casts to the column type when known
     * (bool/int/json), otherwise returns the raw string.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::query()->where('key', $key)->first();
        if (!$row) {
            return $default;
        }

        return match ($row->type) {
            'bool' => filter_var($row->value, FILTER_VALIDATE_BOOLEAN),
            'int' => (int) $row->value,
            'json' => json_decode($row->value, true),
            default => $row->value,
        };
    }

    /**
     * Write a setting. Creates the row if missing. Caller may pass extra
     * descriptors (type, group, label) on first creation; updates only the
     * value on subsequent calls unless explicitly provided.
     */
    public static function set(string $key, mixed $value, array $extra = []): self
    {
        $payload = ['value' => is_array($value) || is_object($value)
            ? json_encode($value)
            : (is_bool($value) ? ($value ? '1' : '0') : (string) $value)];

        return static::query()->updateOrCreate(
            ['key' => $key],
            array_merge($extra, $payload),
        );
    }
}
