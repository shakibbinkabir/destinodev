<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    /** @use HasFactory<\Database\Factories\TestimonialFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'vehicle',
        'rating',
        'text',
        'image_path',
        'status',
        'featured',
        'email',
    ];

    protected $casts = [
        'rating' => 'integer',
        'featured' => 'boolean',
    ];

    protected $hidden = ['email'];
}
