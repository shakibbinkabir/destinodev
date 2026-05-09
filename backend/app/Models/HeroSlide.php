<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    /** @use HasFactory<\Database\Factories\HeroSlideFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'image_path',
        'cta_text',
        'cta_url',
        'sort_order',
        'active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'active' => 'boolean',
    ];
}
