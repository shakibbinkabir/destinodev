<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(2),
            'icon' => $this->faker->randomElement(['Search', 'Ship', 'FileText', 'Headphones', 'ClipboardCheck', 'ShoppingCart']),
            'sort_order' => $this->faker->numberBetween(0, 10),
            'active' => true,
        ];
    }
}
