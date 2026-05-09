<?php

namespace Database\Factories;

use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Partner>
 */
class PartnerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'logo_path' => 'partners/'.$this->faker->uuid().'.png',
            'url' => $this->faker->url(),
            'sort_order' => $this->faker->numberBetween(0, 20),
            'active' => true,
        ];
    }
}
