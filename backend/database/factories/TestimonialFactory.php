<?php

namespace Database\Factories;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->firstName().' '.substr($this->faker->lastName(), 0, 1).'.',
            'country' => $this->faker->country(),
            'vehicle' => $this->faker->optional()->bothify('?? ## ####'),
            'rating' => $this->faker->numberBetween(4, 5),
            'text' => $this->faker->paragraph(3),
            'image_path' => null,
            'status' => 'approved',
            'featured' => $this->faker->boolean(30),
            'email' => $this->faker->optional()->safeEmail(),
        ];
    }

    public function pending(): self
    {
        return $this->state(['status' => 'pending']);
    }
}
