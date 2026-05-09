<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Seeder;

/**
 * Seeds the cars + car_images tables from the legacy src/data/cars.js
 * static data set.
 *
 * Notes
 * - The source records are manually transcribed from cars.js (chosen over
 *   runtime ES-module parsing for reliability — see Stage 2 instructions).
 * - The legacy "id" (e.g. "tc-001") is stored on Car.external_id so the
 *   seeder is idempotent across runs (updateOrCreate keyed on external_id).
 *   The PRD intends external_id for One-Price Stock API ids; reusing it here
 *   for seed bootstrapping does not conflict because Stage 4's stock:sync
 *   filters by source='api', leaving inhouse rows untouched.
 * - cars.js stores prices as USD; PRD §7.1 requires JPY in price_jpy.
 *   We multiply by 150 (rough JPY/USD parity) during seed.
 * - Image URLs from Unsplash are stored as absolute URLs in car_images.path.
 *   See BLOCKERS.md — "Unsplash placeholders" — for the follow-up to swap
 *   in real photography.
 */
class CarsSeeder extends Seeder
{
    public function run(): void
    {
        $usdToJpy = 150;

        $cars = $this->cars();

        foreach ($cars as $row) {
            $car = Car::updateOrCreate(
                ['external_id' => $row['id']],
                [
                    'make' => $row['make'],
                    'model' => $row['model'],
                    'year' => $row['year'],
                    'price_jpy' => $row['price'] * $usdToJpy,
                    'mileage_km' => $row['mileage'],
                    'fuel' => $this->normaliseFuel($row['fuel']),
                    'transmission' => strtolower($row['transmission']),
                    'body_type' => $row['bodyType'],
                    'engine_size' => $row['engineSize'],
                    'color' => $row['color'],
                    'drive_type' => strtolower($row['driveType']),
                    'seats' => $row['seats'],
                    'doors' => $row['doors'],
                    'condition' => $row['condition'],
                    'source' => $row['source'],
                    'featured' => $row['featured'],
                    'badge' => $row['badge'],
                    'battery_capacity' => null,
                    'motor_output' => null,
                    'description' => $row['description'],
                    'status' => 'available',
                ],
            );

            $car->images()->delete();
            foreach ($row['images'] as $i => $url) {
                CarImage::create([
                    'car_id' => $car->id,
                    'path' => $url,
                    'sort_order' => $i,
                    'is_primary' => $i === 0,
                ]);
            }
        }
    }

    private function normaliseFuel(string $raw): string
    {
        return match (strtolower($raw)) {
            'petrol', 'gasoline' => 'gasoline',
            'diesel' => 'diesel',
            'hybrid' => 'hybrid',
            'electric', 'ev' => 'ev',
            default => 'gasoline',
        };
    }

    /**
     * @return list<array<string,mixed>>
     */
    private function cars(): array
    {
        return [
            [
                'id' => 'tc-001', 'make' => 'Toyota', 'model' => 'Land Cruiser 300', 'year' => 2024,
                'price' => 58500, 'mileage' => 12000, 'fuel' => 'Diesel', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '3.3L', 'color' => 'Pearl White',
                'driveType' => '4WD', 'seats' => 7, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => true, 'badge' => 'Featured',
                'images' => [
                    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop',
                ],
                'description' => 'Low-mileage Land Cruiser 300 in excellent condition. Full leather interior, advanced safety suite, and premium JBL audio system. Serviced exclusively at Toyota dealer. Export-ready with all documentation prepared.',
            ],
            [
                'id' => 'tc-002', 'make' => 'Toyota', 'model' => 'Hilux Revo', 'year' => 2023,
                'price' => 32000, 'mileage' => 18000, 'fuel' => 'Diesel', 'transmission' => 'Automatic',
                'bodyType' => 'Pickup', 'engineSize' => '2.8L', 'color' => 'Attitude Black',
                'driveType' => '4WD', 'seats' => 5, 'doors' => 4, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => true, 'badge' => 'Popular',
                'images' => [
                    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=533&fit=crop',
                ],
                'description' => 'Toyota Hilux Revo with TRD body kit. Powerful 2.8L diesel engine with excellent fuel economy. Perfect for both on-road comfort and off-road capability.',
            ],
            [
                'id' => 'tc-003', 'make' => 'Toyota', 'model' => 'Land Cruiser Prado', 'year' => 2023,
                'price' => 45000, 'mileage' => 22000, 'fuel' => 'Diesel', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '2.8L', 'color' => 'Silver Metallic',
                'driveType' => '4WD', 'seats' => 7, 'doors' => 5, 'condition' => 'Very Good',
                'source' => 'inhouse', 'featured' => true, 'badge' => 'Featured',
                'images' => [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop',
                ],
                'description' => 'Well-maintained Prado TX-L with premium leather seats and sunroof. Kdss suspension system for superior ride quality. Full service history available.',
            ],
            [
                'id' => 'tc-004', 'make' => 'Toyota', 'model' => 'GR Supra', 'year' => 2023,
                'price' => 52000, 'mileage' => 8000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Coupe', 'engineSize' => '3.0L', 'color' => 'Renaissance Red',
                'driveType' => 'RWD', 'seats' => 2, 'doors' => 2, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=533&fit=crop',
                ],
                'description' => 'GR Supra RZ with inline-6 turbo engine producing 382 hp. Sport-tuned adaptive suspension, limited slip differential, and forged alloy wheels.',
            ],
            [
                'id' => 'tc-005', 'make' => 'Toyota', 'model' => 'Corolla Cross', 'year' => 2024,
                'price' => 24500, 'mileage' => 5000, 'fuel' => 'Hybrid', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '1.8L', 'color' => 'Celestite Gray',
                'driveType' => 'AWD', 'seats' => 5, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => false, 'badge' => 'New',
                'images' => [
                    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop',
                ],
                'description' => 'Nearly new Corolla Cross Hybrid with exceptional fuel economy. Toyota Safety Sense 3.0, 9-inch touchscreen, and wireless Apple CarPlay.',
            ],
            [
                'id' => 'tc-006', 'make' => 'Toyota', 'model' => 'RAV4', 'year' => 2022,
                'price' => 28000, 'mileage' => 35000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '2.0L', 'color' => 'Urban Khaki',
                'driveType' => 'AWD', 'seats' => 5, 'doors' => 5, 'condition' => 'Very Good',
                'source' => 'api', 'featured' => false, 'badge' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop',
                ],
                'description' => 'Reliable RAV4 Adventure grade with rugged styling. Dynamic Torque Vectoring AWD, multi-terrain select, and premium audio.',
            ],
            [
                'id' => 'mb-001', 'make' => 'Mercedes-Benz', 'model' => 'G63 AMG', 'year' => 2024,
                'price' => 148000, 'mileage' => 3500, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '4.0L V8', 'color' => 'Obsidian Black',
                'driveType' => '4WD', 'seats' => 5, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => true, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=533&fit=crop',
                ],
                'description' => 'Handcrafted AMG 4.0L V8 biturbo engine with 577 hp. AMG RIDE CONTROL suspension, Burmester surround sound, and designo exclusive interior.',
            ],
            [
                'id' => 'mb-002', 'make' => 'Mercedes-Benz', 'model' => 'C300 AMG Line', 'year' => 2023,
                'price' => 42000, 'mileage' => 15000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Sedan', 'engineSize' => '2.0L', 'color' => 'Polar White',
                'driveType' => 'RWD', 'seats' => 5, 'doors' => 4, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => true, 'badge' => 'Featured',
                'images' => [
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=533&fit=crop',
                ],
                'description' => 'C300 with AMG Line exterior and interior. MBUX infotainment with augmented reality navigation, 64-color ambient lighting, and Energizing Comfort.',
            ],
            [
                'id' => 'mb-003', 'make' => 'Mercedes-Benz', 'model' => 'E300', 'year' => 2022,
                'price' => 38500, 'mileage' => 28000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Sedan', 'engineSize' => '2.0L', 'color' => 'Selenite Grey',
                'driveType' => 'RWD', 'seats' => 5, 'doors' => 4, 'condition' => 'Very Good',
                'source' => 'api', 'featured' => false, 'badge' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=533&fit=crop',
                ],
                'description' => 'Executive E-Class with Avantgarde trim. Premium Plus package including Burmester audio, panoramic sunroof, and air-balance fragrance system.',
            ],
            [
                'id' => 'mb-004', 'make' => 'Mercedes-Benz', 'model' => 'GLE 450', 'year' => 2023,
                'price' => 62000, 'mileage' => 19000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '3.0L', 'color' => 'Iridium Silver',
                'driveType' => '4WD', 'seats' => 5, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'New',
                'images' => [
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&h=533&fit=crop',
                ],
                'description' => 'GLE 450 4MATIC with EQ Boost. AMG Line, air suspension, head-up display, and panoramic sliding sunroof.',
            ],
            [
                'id' => 'bm-001', 'make' => 'BMW', 'model' => 'X5 xDrive40i', 'year' => 2023,
                'price' => 56000, 'mileage' => 20000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '3.0L', 'color' => 'Carbon Black',
                'driveType' => 'AWD', 'seats' => 5, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => true, 'badge' => 'Featured',
                'images' => [
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=533&fit=crop',
                ],
                'description' => 'BMW X5 M Sport package with adaptive M suspension. Harman Kardon surround sound, gesture control, and BMW Live Cockpit Professional.',
            ],
            [
                'id' => 'bm-002', 'make' => 'BMW', 'model' => '330i M Sport', 'year' => 2023,
                'price' => 36500, 'mileage' => 16000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Sedan', 'engineSize' => '2.0L', 'color' => 'Alpine White',
                'driveType' => 'RWD', 'seats' => 5, 'doors' => 4, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => false, 'badge' => 'Popular',
                'images' => [
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=533&fit=crop',
                ],
                'description' => '330i with M Sport package and M Performance exhaust. Sport seats, M Sport brakes, and variable sport steering.',
            ],
            [
                'id' => 'ns-001', 'make' => 'Nissan', 'model' => 'Patrol Y62', 'year' => 2023,
                'price' => 52000, 'mileage' => 25000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '5.6L V8', 'color' => 'Hermosa Blue',
                'driveType' => '4WD', 'seats' => 8, 'doors' => 5, 'condition' => 'Very Good',
                'source' => 'inhouse', 'featured' => false, 'badge' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop',
                ],
                'description' => 'Full-size Patrol with V8 power. Hydraulic body motion control, Bose audio, and premium leather with quilted stitching throughout.',
            ],
            [
                'id' => 'ns-002', 'make' => 'Nissan', 'model' => 'GT-R NISMO', 'year' => 2022,
                'price' => 115000, 'mileage' => 6000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Coupe', 'engineSize' => '3.8L V6', 'color' => 'NISMO Red',
                'driveType' => 'AWD', 'seats' => 4, 'doors' => 2, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop',
                ],
                'description' => 'Hand-assembled VR38DETT twin-turbo engine by master craftsman. Carbon fiber body components, NISMO-tuned suspension, and Recaro seats.',
            ],
            [
                'id' => 'pr-001', 'make' => 'Porsche', 'model' => 'Cayenne S', 'year' => 2023,
                'price' => 78000, 'mileage' => 14000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '2.9L V6', 'color' => 'Carrara White',
                'driveType' => 'AWD', 'seats' => 5, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => false, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=533&fit=crop',
                ],
                'description' => 'Cayenne S with Sport Chrono package, PASM air suspension, panoramic roof, and Bose surround sound. Full Porsche service history.',
            ],
            [
                'id' => 'pr-002', 'make' => 'Porsche', 'model' => '911 Carrera S', 'year' => 2022,
                'price' => 125000, 'mileage' => 9500, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Coupe', 'engineSize' => '3.0L', 'color' => 'GT Silver',
                'driveType' => 'RWD', 'seats' => 4, 'doors' => 2, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop',
                ],
                'description' => '992-generation 911 Carrera S with PDK transmission. Sport exhaust, PASM sport suspension, and full leather interior in Black/Bordeaux Red.',
            ],
            [
                'id' => 'lx-001', 'make' => 'Lexus', 'model' => 'LX 600', 'year' => 2024,
                'price' => 82000, 'mileage' => 8000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'SUV', 'engineSize' => '3.4L V6', 'color' => 'Sonic Titanium',
                'driveType' => '4WD', 'seats' => 7, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'New',
                'images' => [
                    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                ],
                'description' => 'All-new LX 600 with twin-turbo V6. Mark Levinson reference audio, fingerprint authentication, and Executive rear seat package.',
            ],
            [
                'id' => 'hn-001', 'make' => 'Honda', 'model' => 'Civic Type R', 'year' => 2024,
                'price' => 42000, 'mileage' => 4000, 'fuel' => 'Petrol', 'transmission' => 'Manual',
                'bodyType' => 'Hatchback', 'engineSize' => '2.0L', 'color' => 'Championship White',
                'driveType' => 'FWD', 'seats' => 5, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'api', 'featured' => false, 'badge' => 'New',
                'images' => [
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop',
                ],
                'description' => 'FL5 Civic Type R with 315 hp turbocharged engine. Rev-matching 6-speed manual, adaptive dampers, and lightweight forged BBS wheels.',
            ],
            [
                'id' => 'sb-001', 'make' => 'Subaru', 'model' => 'WRX STI', 'year' => 2021,
                'price' => 35000, 'mileage' => 32000, 'fuel' => 'Petrol', 'transmission' => 'Manual',
                'bodyType' => 'Sedan', 'engineSize' => '2.5L', 'color' => 'WR Blue Pearl',
                'driveType' => 'AWD', 'seats' => 5, 'doors' => 4, 'condition' => 'Very Good',
                'source' => 'api', 'featured' => false, 'badge' => 'Popular',
                'images' => [
                    'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop',
                ],
                'description' => 'Final edition WRX STI with EJ25 boxer turbo. Brembo brakes, Bilstein dampers, and DCCD driver-controlled center differential.',
            ],
            [
                'id' => 'tc-007', 'make' => 'Toyota', 'model' => 'Alphard Executive Lounge', 'year' => 2024,
                'price' => 68000, 'mileage' => 2000, 'fuel' => 'Hybrid', 'transmission' => 'Automatic',
                'bodyType' => 'Van', 'engineSize' => '2.5L', 'color' => 'Platinum White Pearl',
                'driveType' => 'AWD', 'seats' => 7, 'doors' => 5, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop',
                ],
                'description' => 'Top-of-the-line Alphard Executive Lounge with Ottoman rear seats. JBL premium audio, digital rear-view mirror, and advanced parking support.',
            ],
            [
                'id' => 'tc-008', 'make' => 'Toyota', 'model' => 'Corolla Fielder', 'year' => 2020,
                'price' => 8500, 'mileage' => 65000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Wagon', 'engineSize' => '1.5L', 'color' => 'Super White',
                'driveType' => 'FWD', 'seats' => 5, 'doors' => 5, 'condition' => 'Good',
                'source' => 'api', 'featured' => false, 'badge' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=533&fit=crop',
                ],
                'description' => 'Economical and practical Corolla Fielder with spacious cargo area. Toyota Safety Sense, backup camera, and keyless entry.',
            ],
            [
                'id' => 'bm-003', 'make' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023,
                'price' => 72000, 'mileage' => 11000, 'fuel' => 'Petrol', 'transmission' => 'Automatic',
                'bodyType' => 'Coupe', 'engineSize' => '3.0L', 'color' => 'Isle of Man Green',
                'driveType' => 'RWD', 'seats' => 4, 'doors' => 2, 'condition' => 'Excellent',
                'source' => 'inhouse', 'featured' => false, 'badge' => 'Premium',
                'images' => [
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=533&fit=crop',
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=533&fit=crop',
                ],
                'description' => 'M4 Competition with 503 hp S58 twin-turbo inline-6. M Carbon bucket seats, M Carbon ceramic brakes, and M Drive Professional.',
            ],
        ];
    }
}
