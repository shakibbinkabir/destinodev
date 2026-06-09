<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

/**
 * Seeds the settings table per PRD §7.11.
 *
 * Source values come from src/data/company.js. Where company.social.*
 * values are "#" placeholders we store empty strings (per Stage 2
 * instructions). Real social URLs are tracked under the Stage 4 inputs
 * required from the client (see BLOCKERS.md).
 */
class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            // Company
            ['company.name', 'DESTINO Corporation', 'string', 'company', 'Company name'],
            ['company.email', 'export@destino.jp', 'email', 'company', 'Email'],
            ['company.phone', '+81-45-949-6777', 'phone', 'company', 'Phone'],
            ['company.fax', '+81-45-482-6444', 'phone', 'company', 'Fax'],
            ['company.whatsapp_url', 'https://wa.me/81459496777', 'url', 'company', 'WhatsApp URL'],
            ['company.address', '5-20-25 Chigasaki-Minami, Tsuzuki-ku, Yokohama, Kanagawa 224-0037, Japan', 'string', 'company', 'Address'],
            ['company.business_hours', "Tuesday – Saturday 10:00–19:00\nSunday & Holidays 10:00–18:00\nMonday Closed", 'string', 'company', 'Business hours'],
            ['company.representative', 'Takeshi Yamamoto', 'string', 'company', 'Representative'],

            // Social — frontend uses "#" as placeholder; we store empty strings.
            ['social.facebook', '', 'url', 'social', 'Facebook URL'],
            ['social.instagram', '', 'url', 'social', 'Instagram URL'],
            ['social.youtube', '', 'url', 'social', 'YouTube URL'],
            ['social.linkedin', '', 'url', 'social', 'LinkedIn URL'],
            ['social.x', '', 'url', 'social', 'X (Twitter) URL'],

            // SEO
            ['seo.default_meta_title', 'DESTINO Corporation — Japanese Vehicle Exports', 'string', 'seo', 'Default meta title'],
            ['seo.default_meta_description', "Japan's trusted vehicle exporter since 1995. Premium used cars sourced and shipped to over 50 countries worldwide.", 'string', 'seo', 'Default meta description'],

            // Integrations
            ['integrations.youtube_channel_id', 'UC9r_ugFs9RL4OkeEAwztQ7g', 'string', 'integrations', 'YouTube channel ID'],

            // Homepage section visibility toggles. YouTube is on by default
            // (a channel ID is seeded); Facebook/Instagram stay off until the
            // operator fills in social.facebook / social.instagram URLs.
            ['homepage.youtube_enabled', '1', 'bool', 'homepage', 'Show YouTube section'],
            ['homepage.facebook_enabled', '0', 'bool', 'homepage', 'Show Facebook section'],
            ['homepage.instagram_enabled', '0', 'bool', 'homepage', 'Show Instagram section'],
        ];

        foreach ($entries as [$key, $value, $type, $group, $label]) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => $type,
                    'group' => $group,
                    'label' => $label,
                ],
            );
        }

        // Prune retired keys so they stop leaking into the public /settings
        // response on already-seeded installs.
        Setting::whereIn('key', ['company.jumvea_member'])->delete();
    }
}
