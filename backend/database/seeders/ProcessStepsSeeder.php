<?php

namespace Database\Seeders;

use App\Models\ProcessStep;
use Illuminate\Database\Seeder;

/**
 * Seeds the 4 "How It Works" steps from src/components/ProcessSteps.jsx.
 * Icons are lucide-react component name strings.
 */
class ProcessStepsSeeder extends Seeder
{
    public function run(): void
    {
        $steps = [
            [
                'icon' => 'Search',
                'title' => 'Browse & Select',
                'description' => 'Search our extensive inventory or tell us exactly what you need. We have access to thousands of vehicles through Japanese auctions.',
            ],
            [
                'icon' => 'ClipboardCheck',
                'title' => 'Inspection & Purchase',
                'description' => 'Every vehicle undergoes a thorough inspection. We provide detailed reports with photos so you can purchase with confidence.',
            ],
            [
                'icon' => 'Ship',
                'title' => 'Shipping & Export',
                'description' => 'We handle all export documentation, customs clearance, and international shipping to your nearest port.',
            ],
            [
                'icon' => 'ThumbsUp',
                'title' => 'Receive & Enjoy',
                'description' => 'Your vehicle arrives at the designated port. We assist with any local import requirements and after-sales support.',
            ],
        ];

        foreach ($steps as $i => $step) {
            ProcessStep::updateOrCreate(
                ['title' => $step['title']],
                [
                    'description' => $step['description'],
                    'icon' => $step['icon'],
                    'sort_order' => $i,
                    'active' => true,
                ],
            );
        }
    }
}
