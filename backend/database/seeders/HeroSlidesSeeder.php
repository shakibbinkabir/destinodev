<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

/**
 * Seeds three hero slides matching src/pages/HomePage.jsx → heroImages.
 * Idempotent on (sort_order). The frontend currently shares a single
 * tagline across slides; we replicate that copy so the API can drive the
 * hero unchanged.
 */
class HeroSlidesSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'title' => 'For Those Who Love Import Cars.',
                'subtitle' => "Japan's trusted vehicle exporter since 1995. Premium used cars sourced and shipped to over 50 countries worldwide.",
                'image' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&h=900&fit=crop',
            ],
            [
                'title' => 'For Those Who Love Import Cars.',
                'subtitle' => "Japan's trusted vehicle exporter since 1995. Premium used cars sourced and shipped to over 50 countries worldwide.",
                'image' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&h=900&fit=crop',
            ],
            [
                'title' => 'For Those Who Love Import Cars.',
                'subtitle' => "Japan's trusted vehicle exporter since 1995. Premium used cars sourced and shipped to over 50 countries worldwide.",
                'image' => 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop',
            ],
        ];

        foreach ($slides as $i => $slide) {
            HeroSlide::updateOrCreate(
                ['sort_order' => $i],
                [
                    'title' => $slide['title'],
                    'subtitle' => $slide['subtitle'],
                    'image_path' => $slide['image'],
                    'cta_text' => 'Browse Stock',
                    'cta_url' => '/stock',
                    'active' => true,
                ],
            );
        }
    }
}
