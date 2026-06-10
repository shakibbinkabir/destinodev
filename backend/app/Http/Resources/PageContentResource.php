<?php

namespace App\Http\Resources;

use App\Models\PageContent;
use App\Support\PublicMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PageContent
 */
class PageContentResource extends JsonResource
{
    public static $wrap = 'data';

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'body' => $this->body,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            // Optional hero image uploaded via Filament (currently the About
            // page). Stored as a relative path under extras; resolved to a
            // public URL here so the frontend can use it directly.
            'image' => PublicMedia::url(data_get($this->extras, 'about_image_path')),
            'extras' => $this->extras ?? [],
        ];
    }
}
