<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;

/**
 * Seeds partners from src/components/Partners.jsx (10 entries).
 * Frontend currently uses /logo-link.png for every partner — see
 * BLOCKERS.md "Real partner logos" for the follow-up.
 */
class PartnersSeeder extends Seeder
{
    public function run(): void
    {
        $partners = [
            ['name' => 'Caterham', 'url' => 'https://destino.jp'],
            ['name' => 'Lotus Cars', 'url' => 'https://destino.jp'],
            ['name' => 'Morgan Motor', 'url' => 'https://destino.jp'],
            ['name' => 'Yokohama Tires', 'url' => null],
            ['name' => 'Caterpillar', 'url' => null],
            ['name' => 'Fekema', 'url' => null],
            ['name' => 'JUMVEA', 'url' => null],
            ['name' => 'USS Auto Auction', 'url' => null],
            ['name' => 'AUCNET', 'url' => null],
            ['name' => 'MK Seiko', 'url' => 'https://destinocojp.com'],
        ];

        foreach ($partners as $i => $partner) {
            Partner::updateOrCreate(
                ['name' => $partner['name']],
                [
                    'logo_path' => '/logo-link.png',
                    'url' => $partner['url'],
                    'sort_order' => $i,
                    'active' => true,
                ],
            );
        }
    }
}
