<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveredCar extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveredCarFactory> */
    use HasFactory;

    protected $fillable = [
        'make',
        'model',
        'year',
        'customer_name',
        'destination_country',
        'destination_city',
        'delivery_date',
        'testimonial_text',
        'image_path',
        'status',
    ];

    protected $casts = [
        'year' => 'integer',
        'delivery_date' => 'date',
    ];
}
