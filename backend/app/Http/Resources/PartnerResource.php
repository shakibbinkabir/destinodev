<?php

namespace App\Http\Resources;

use App\Models\Partner;
use App\Support\PublicMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Partner
 */
class PartnerResource extends JsonResource
{
    public static $wrap = 'data';

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo' => PublicMedia::url($this->logo_path),
            'url' => $this->url,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
