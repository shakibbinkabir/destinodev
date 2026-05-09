<?php

namespace App\Http\Resources;

use App\Models\HeroSlide;
use App\Support\PublicMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin HeroSlide
 */
class HeroSlideResource extends JsonResource
{
    public static $wrap = 'data';

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'image' => PublicMedia::url($this->image_path),
            'cta_text' => $this->cta_text,
            'cta_url' => $this->cta_url,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
