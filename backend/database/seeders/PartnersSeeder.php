<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;

/**
 * Seeds the "Our Sales Partners" block (homepage + About page).
 *
 * Each logo is self-hosted in the frontend at `public/partners/<file>` (so the
 * block does not depend on third-party logo hosts staying up). logo_path holds
 * the absolute frontend URL — the "legacy absolute URL" passthrough documented
 * on PublicMedia::url(). The client can still replace any logo by uploading a
 * new image through the Filament Partners resource (which stores a public-disk
 * path instead). See BLOCKERS.md "Real partner logos".
 */
class PartnersSeeder extends Seeder
{
    /** Frontend origin that serves the bundled logos under /partners/. */
    private const LOGO_BASE = 'https://destinocojp.com/partners/';

    public function run(): void
    {
        $partners = [
            ['name' => 'Caterham', 'logo' => 'caterham.png', 'url' => 'https://destino.jp'],
            ['name' => 'Lotus Cars', 'logo' => 'lotus.png', 'url' => 'https://destino.jp'],
            ['name' => 'Morgan Motor', 'logo' => 'morgan.png', 'url' => 'https://destino.jp'],
            ['name' => 'Yokohama Tires', 'logo' => 'yokohama.svg', 'url' => null],
            ['name' => 'Caterpillar', 'logo' => 'caterpillar.png', 'url' => null],
            ['name' => 'JUMVEA', 'logo' => 'jumvea.png', 'url' => null],
            ['name' => 'USS Auto Auction', 'logo' => 'uss.png', 'url' => null],
            ['name' => 'AUCNET', 'logo' => 'aucnet.png', 'url' => null],
            ['name' => 'MK Seiko', 'logo' => 'mkseiko.png', 'url' => 'https://destinocojp.com'],
        ];

        foreach ($partners as $i => $partner) {
            Partner::updateOrCreate(
                ['name' => $partner['name']],
                [
                    'logo_path' => self::LOGO_BASE.$partner['logo'],
                    'url' => $partner['url'],
                    'sort_order' => $i,
                    'active' => true,
                ],
            );
        }

        // Removed from the partner roster — drop the stale row if it was seeded.
        Partner::where('name', 'Fekema')->delete();
    }
}
