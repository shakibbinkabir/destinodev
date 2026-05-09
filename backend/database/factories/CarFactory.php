<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Car>
 */
class CarFactory extends Factory
{
    public function definition(): array
    {
        $makes = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus', 'Suzuki', 'Mercedes-Benz', 'BMW'];
        $bodies = ['SUV', 'Sedan', 'Coupe', 'Hatchback', 'Pickup', 'Wagon', 'Van'];
        $colors = ['Pearl White', 'Obsidian Black', 'Silver Metallic', 'Champion Blue', 'Crimson Red', 'Graphite Grey'];
        $models = ['Land Cruiser', 'Hilux', 'Prado', 'Alphard', 'Vellfire', 'Patrol', 'X-Trail', 'CR-V', 'Civic'];
        $fuel = $this->faker->randomElement(['gasoline', 'hybrid', 'ev', 'diesel']);

        return [
            'external_id' => null,
            'make' => $this->faker->randomElement($makes),
            'model' => $this->faker->randomElement($models),
            'year' => $this->faker->numberBetween(2018, 2024),
            'price_jpy' => $this->faker->numberBetween(800_000, 18_000_000),
            'mileage_km' => $this->faker->numberBetween(2_000, 120_000),
            'fuel' => $fuel,
            'transmission' => $this->faker->randomElement(['automatic', 'manual', 'cvt']),
            'body_type' => $this->faker->randomElement($bodies),
            'engine_size' => $fuel === 'ev' ? null : $this->faker->randomElement(['1.5L', '2.0L', '2.5L', '3.0L', '3.5L']),
            'color' => $this->faker->randomElement($colors),
            'drive_type' => $this->faker->randomElement(['2wd', '4wd', 'awd', 'fwd', 'rwd']),
            'seats' => $this->faker->randomElement([2, 4, 5, 7, 8]),
            'doors' => $this->faker->randomElement([2, 4, 5]),
            'condition' => $this->faker->randomElement(['Excellent', 'Very Good', 'Good']),
            'source' => $this->faker->randomElement(['inhouse', 'api']),
            'featured' => $this->faker->boolean(20),
            'badge' => $this->faker->optional(0.5)->randomElement(['New Arrival', 'Hot Deal', 'Featured', 'Premium', 'Popular']),
            'battery_capacity' => in_array($fuel, ['ev', 'hybrid']) ? $this->faker->randomElement(['40 kWh', '60 kWh', '75 kWh', '1.3 kWh']) : null,
            'motor_output' => in_array($fuel, ['ev', 'hybrid']) ? $this->faker->randomElement(['110 kW', '150 kW', '70 kW']) : null,
            'description' => $this->faker->paragraph(3),
            'status' => 'available',
        ];
    }
}
