<?php

namespace Database\Factories;

use App\Models\ProcessStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProcessStep>
 */
class ProcessStepFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(2),
            'description' => $this->faker->paragraph(2),
            'icon' => $this->faker->randomElement(['Search', 'ClipboardCheck', 'Ship', 'ThumbsUp']),
            'sort_order' => $this->faker->numberBetween(0, 10),
            'active' => true,
        ];
    }
}
