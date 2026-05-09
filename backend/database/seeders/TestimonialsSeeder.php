<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

/**
 * Seeds testimonials from src/data/testimonials.js.
 *
 * All seeded entries are pre-approved (status='approved') because they are
 * the existing public-site testimonials. Idempotent: keyed on (name, country).
 */
class TestimonialsSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['name' => 'James K.', 'country' => 'South Africa', 'rating' => 5, 'text' => 'Destino made the entire process seamless. From selecting my Land Cruiser to receiving it at Durban port, every step was communicated clearly. The vehicle arrived in exactly the condition described. I have already recommended them to colleagues.'],
            ['name' => 'Ahmed R.', 'country' => 'United Arab Emirates', 'rating' => 5, 'text' => 'Professional service from start to finish. The inspection report was thorough and honest. My G63 arrived ahead of schedule, and the documentation was handled flawlessly. This is my third purchase through Destino.'],
            ['name' => 'David M.', 'country' => 'Kenya', 'rating' => 5, 'text' => 'I was hesitant about buying a vehicle from Japan, but the team at Destino guided me through every detail. The pricing was transparent with no hidden fees. My Hilux is exactly what I needed for my business operations.'],
            ['name' => 'Tomoko S.', 'country' => 'New Zealand', 'rating' => 4, 'text' => 'Excellent communication throughout the entire export process. The dedicated advisor assigned to me was knowledgeable and responsive. The vehicle passed local compliance inspection on the first attempt.'],
            ['name' => 'Robert T.', 'country' => 'Jamaica', 'rating' => 5, 'text' => 'Destino sourced a specific model I had been searching for through their auction network. Competitive pricing and reliable shipping to Kingston. The after-sales support has also been very helpful.'],
            ['name' => 'Patrick O.', 'country' => 'Tanzania', 'rating' => 5, 'text' => 'Working with Destino has been a consistently positive experience over multiple purchases. Their inspection standards are high, and the export documentation is always thorough and accurate.'],
        ];

        foreach ($rows as $row) {
            Testimonial::updateOrCreate(
                ['name' => $row['name'], 'country' => $row['country']],
                [
                    'vehicle' => null,
                    'rating' => $row['rating'],
                    'text' => $row['text'],
                    'image_path' => null,
                    'status' => 'approved',
                    'featured' => true,
                    'email' => null,
                ],
            );
        }
    }
}
