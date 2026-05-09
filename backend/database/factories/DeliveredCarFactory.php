<?php

namespace Database\Factories;

use App\Models\DeliveredCar;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeliveredCar>
 */
class DeliveredCarFactory extends Factory
{
    public function definition(): array
    {
        $countries = ['Kenya', 'Tanzania', 'New Zealand', 'Singapore', 'Jamaica', 'United Arab Emirates', 'South Africa', 'Fiji', 'Mozambique', 'Barbados'];

        return [
            'make' => $this->faker->randomElement(['Toyota', 'Nissan', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus']),
            'model' => $this->faker->randomElement(['Land Cruiser', 'Hilux', 'Patrol', 'G63 AMG', 'X5', 'LX 600']),
            'year' => $this->faker->numberBetween(2019, 2024),
            'customer_name' => $this->faker->firstName().' '.substr($this->faker->lastName(), 0, 1).'.',
            'destination_country' => $this->faker->randomElement($countries),
            'destination_city' => $this->faker->optional()->city(),
            'delivery_date' => $this->faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'testimonial_text' => $this->faker->optional(0.5)->sentence(12),
            'image_path' => 'delivered/'.$this->faker->uuid().'.jpg',
            'status' => 'published',
        ];
    }
}
