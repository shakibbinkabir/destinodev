<?php

namespace Database\Factories;

use App\Models\HeroSlide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HeroSlide>
 */
class HeroSlideFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'subtitle' => $this->faker->sentence(10),
            'image_path' => 'hero/'.$this->faker->uuid().'.jpg',
            'cta_text' => 'Browse Stock',
            'cta_url' => '/stock',
            'sort_order' => $this->faker->numberBetween(0, 10),
            'active' => true,
        ];
    }
}
