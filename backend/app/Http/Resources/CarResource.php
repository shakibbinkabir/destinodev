<?php

namespace App\Http\Resources;

use App\Models\Car;
use App\Support\PublicMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Car
 */
class CarResource extends JsonResource
{
    public static $wrap = 'data';

    /**
     * Output shape per PRD §8.1. Field names are snake_case (matches the PRD's
     * documented JSON response, not the camelCase used in the legacy
     * src/data/cars.js — Stage 5's React API client maps the two).
     *
     * `price` maps from `price_jpy` and `mileage` maps from `mileage_km`
     * because the PRD response shape drops the unit suffixes.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'make' => $this->make,
            'model' => $this->model,
            'year' => (int) $this->year,
            'price' => (int) $this->price_jpy,
            'mileage' => (int) $this->mileage_km,
            'fuel' => $this->fuel,
            'transmission' => $this->transmission,
            'body_type' => $this->body_type,
            'engine_size' => $this->engine_size,
            'color' => $this->color,
            'drive_type' => $this->drive_type,
            'seats' => (int) $this->seats,
            'doors' => (int) $this->doors,
            'condition' => $this->condition,
            'source' => $this->source,
            'featured' => (bool) $this->featured,
            'badge' => $this->badge,
            'battery_capacity' => $this->battery_capacity,
            'motor_output' => $this->motor_output,
            'description' => $this->description,
            'images' => $this->whenLoaded('images', fn () => $this->images
                ->sortBy('sort_order')
                ->map(fn ($image) => PublicMedia::url($image->path))
                ->filter()
                ->values()
                ->all(),
                []),
        ];
    }
}
