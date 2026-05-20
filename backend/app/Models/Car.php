<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
    /** @use HasFactory<\Database\Factories\CarFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'lot_bid',
        'chassis_code',
        'auction_house',
        'auction_grade',
        'make',
        'model',
        'year',
        'price_jpy',
        'mileage_km',
        'fuel',
        'transmission',
        'body_type',
        'engine_size',
        'color',
        'drive_type',
        'seats',
        'doors',
        'condition',
        'source',
        'featured',
        'badge',
        'battery_capacity',
        'motor_output',
        'description',
        'status',
    ];

    protected $casts = [
        'year' => 'integer',
        'price_jpy' => 'decimal:2',
        'mileage_km' => 'integer',
        'seats' => 'integer',
        'doors' => 'integer',
        'featured' => 'boolean',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(CarImage::class)->where('is_primary', true);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }
}
