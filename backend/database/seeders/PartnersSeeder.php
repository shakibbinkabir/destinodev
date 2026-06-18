<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;

/**
 * Seeds the "Our Sales Partners" block (homepage + About page) with DESTINO's
 * own brand & group banners, mirroring the banner strip on the live destino.jp
 * site: YouTube channel, Yahoo! Shopping store, Morgan Cars Yokohama, Caterham
 * Yokohama, Sagittario, and Car Washing EXP.
 *
 * logo_path holds absolute URLs to the banner artwork hosted on destino.jp —
 * the "legacy absolute URL" convention documented on PublicMedia::url(). The
 * client can replace any banner by uploading a new image through the Filament
 * Partners resource (which instead stores a public-disk path).
 *
 * This seeder is authoritative: it deletes any partner not listed below, so
 * re-running it restores the block to exactly these six entries (and clears the
 * old `/logo-link.png` placeholder rows — see BLOCKERS.md "Real partner logos").
 */
class PartnersSeeder extends Seeder
{
    private const BANNERS = 'https://destino.jp/wordpress/wp-content/themes/destino/img/index/banners/';

    public function run(): void
    {
        $partners = [
            [
                'name' => 'DESTINO Official Channel',
                'logo_path' => self::BANNERS.'yt.jpg',
                'url' => 'https://www.youtube.com/channel/UC9r_ugFs9RL4OkeEAwztQ7g',
            ],
            [
                'name' => 'Yahoo! Shopping Store',
                'logo_path' => self::BANNERS.'yhshop.jpg',
                'url' => 'https://store.shopping.yahoo.co.jp/destino-rc/',
            ],
            [
                'name' => 'Morgan Cars Yokohama',
                'logo_path' => self::BANNERS.'morgan.jpg',
                'url' => 'https://www.destino.jp/morgancars-yokohama/',
            ],
            [
                'name' => 'Caterham Yokohama',
                'logo_path' => self::BANNERS.'caterham.jpg',
                'url' => 'https://www.destino.jp/caterham-yokohama/',
            ],
            [
                'name' => 'Sagittario',
                'logo_path' => self::BANNERS.'sagittario.jpg',
                'url' => 'https://sagittario-corse.jp/',
            ],
            [
                'name' => 'Car Washing EXP',
                'logo_path' => self::BANNERS.'carwashing.jpg',
                'url' => 'https://destino-v.com/',
            ],
        ];

        foreach ($partners as $i => $partner) {
            Partner::updateOrCreate(
                ['name' => $partner['name']],
                [
                    'logo_path' => $partner['logo_path'],
                    'url' => $partner['url'],
                    'sort_order' => $i,
                    'active' => true,
                ],
            );
        }

        // Authoritative: drop any partner that is no longer part of the block.
        Partner::whereNotIn('name', array_column($partners, 'name'))->delete();
    }
}
