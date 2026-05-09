<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Order matters: Shield's permission rows are created by
            // shield:generate and must exist before role sync runs.
            ShieldSeeder::class,
            RolesAndAdminSeeder::class,

            // Public-facing content
            CarsSeeder::class,
            DeliveredCarsSeeder::class,
            TestimonialsSeeder::class,
            PageContentsSeeder::class,
            HeroSlidesSeeder::class,
            PartnersSeeder::class,
            ServicesSeeder::class,
            ProcessStepsSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
