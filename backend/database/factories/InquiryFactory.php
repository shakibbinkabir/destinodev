<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\Inquiry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inquiry>
 */
class InquiryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->optional()->e164PhoneNumber(),
            'country' => $this->faker->optional()->country(),
            'message' => $this->faker->paragraph(2),
            'car_id' => $this->faker->optional(0.5)->passthrough(Car::factory()),
            'car_reference' => null,
            'source' => $this->faker->randomElement(['contact_page', 'single_car', 'homepage', 'footer', 'other']),
            'status' => 'new',
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'admin_notes' => null,
        ];
    }
}
