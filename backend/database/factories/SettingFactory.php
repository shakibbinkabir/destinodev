<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'key' => $this->faker->unique()->word().'.'.$this->faker->word(),
            'value' => $this->faker->sentence(),
            'type' => 'string',
            'group' => $this->faker->randomElement(['company', 'social', 'seo', 'integrations']),
            'label' => $this->faker->sentence(3),
        ];
    }
}
