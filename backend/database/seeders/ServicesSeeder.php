<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

/**
 * Seeds the 6 services rendered on src/pages/AboutPage.jsx → services.
 * Icons are stored as lucide-react component name strings.
 */
class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'icon' => 'Search',
                'title' => 'Vehicle Sourcing & Export',
                'description' => 'Access to thousands of vehicles through Japanese auctions and dealer networks. We find the right vehicle at the right price for your market.',
            ],
            [
                'icon' => 'ShoppingCart',
                'title' => 'Auction Purchasing',
                'description' => 'Experienced bidding team attending major Japanese auto auctions weekly. Real-time bidding with transparent fee structure.',
            ],
            [
                'icon' => 'ClipboardCheck',
                'title' => 'Inspection & Quality Assurance',
                'description' => 'Multi-point inspection for every vehicle before purchase. Detailed condition reports with high-resolution photographs provided to clients.',
            ],
            [
                'icon' => 'Ship',
                'title' => 'Shipping & Logistics',
                'description' => 'RoRo and container shipping to ports worldwide. We coordinate with reliable carriers and provide real-time shipment tracking.',
            ],
            [
                'icon' => 'FileText',
                'title' => 'Documentation & Customs Support',
                'description' => 'Complete export documentation including certificates of title, export certificates, and Bill of Lading. Customs clearance assistance available.',
            ],
            [
                'icon' => 'Headphones',
                'title' => 'After-Sales Support',
                'description' => 'Continued support after delivery. We assist with any questions regarding your vehicle and maintain long-term client relationships.',
            ],
        ];

        foreach ($services as $i => $service) {
            Service::updateOrCreate(
                ['title' => $service['title']],
                [
                    'description' => $service['description'],
                    'icon' => $service['icon'],
                    'sort_order' => $i,
                    'active' => true,
                ],
            );
        }
    }
}
