<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CarImage>
 */
class CarImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'car_id' => Car::factory(),
            'path' => 'cars/'.$this->faker->uuid().'.jpg',
            'sort_order' => 0,
            'is_primary' => false,
        ];
    }

    public function primary(): self
    {
        return $this->state(['is_primary' => true]);
    }
}
