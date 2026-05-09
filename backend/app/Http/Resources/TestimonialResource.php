<?php

namespace App\Http\Resources;

use App\Models\Testimonial;
use App\Support\PublicMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Testimonial
 *
 * Email is hidden on the model and never serialized publicly (PRD §7.5).
 */
class TestimonialResource extends JsonResource
{
    public static $wrap = 'data';

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'country' => $this->country,
            'vehicle' => $this->vehicle,
            'rating' => (int) $this->rating,
            'text' => $this->text,
            'image' => PublicMedia::url($this->image_path),
            'featured' => (bool) $this->featured,
        ];
    }
}
