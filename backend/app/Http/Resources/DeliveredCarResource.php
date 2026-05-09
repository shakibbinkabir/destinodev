<?php

namespace App\Http\Resources;

use App\Models\DeliveredCar;
use App\Support\PublicMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin DeliveredCar
 */
class DeliveredCarResource extends JsonResource
{
    public static $wrap = 'data';

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'make' => $this->make,
            'model' => $this->model,
            'year' => (int) $this->year,
            'customer_name' => $this->customer_name,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'delivery_date' => optional($this->delivery_date)->toDateString(),
            'testimonial_text' => $this->testimonial_text,
            'image' => PublicMedia::url($this->image_path),
        ];
    }
}
