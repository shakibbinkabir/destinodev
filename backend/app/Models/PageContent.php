<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    /** @use HasFactory<\Database\Factories\PageContentFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'body',
        'meta_title',
        'meta_description',
        'extras',
    ];

    protected $casts = [
        'extras' => 'array',
    ];
}
