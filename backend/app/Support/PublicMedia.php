<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Resolves a media path stored on a model into a public URL. Legacy seeded
 * rows hold absolute URLs (Unsplash placeholders — see BLOCKERS.md); rows
 * uploaded through Filament hold a path relative to the public disk root.
 */
class PublicMedia
{
    public static function url(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
