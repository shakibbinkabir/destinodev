<?php

namespace Database\Seeders;

use App\Models\DeliveredCar;
use Illuminate\Database\Seeder;

/**
 * Seeds delivered_cars from src/data/company.js → deliveredCars.
 *
 * - Manually transcribed (12 entries) for reliability over runtime parsing.
 * - Idempotent: keyed on a synthesised "make-model-year-deliveryDate"
 *   composite via a plain-text "ref" stored in the customer_name fallback;
 *   actually we use updateOrCreate keyed on (make, model, year, delivery_date)
 *   which is unique across the seed set.
 * - Source images are absolute Unsplash URLs (placeholder; see BLOCKERS.md).
 * - Where customerName is null in source we substitute "Anonymous customer"
 *   because customer_name is NOT NULL per PRD §7.3.
 */
class DeliveredCarsSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->records() as $row) {
            DeliveredCar::updateOrCreate(
                [
                    'make' => $row['make'],
                    'model' => $row['model'],
                    'year' => $row['year'],
                    'delivery_date' => $row['deliveryDate'],
                ],
                [
                    'customer_name' => $row['customerName'] ?? 'Anonymous customer',
                    'destination_country' => $row['destination'],
                    'destination_city' => null,
                    'testimonial_text' => $row['testimonial'],
                    'image_path' => $row['image'],
                    'status' => 'published',
                ],
            );
        }
    }

    /**
     * @return list<array<string,mixed>>
     */
    private function records(): array
    {
        return [
            ['make' => 'Toyota', 'model' => 'Land Cruiser 300', 'year' => 2023, 'destination' => 'South Africa', 'deliveryDate' => '2024-11-15', 'image' => 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop', 'customerName' => 'James K.', 'testimonial' => 'Arrived in perfect condition. The entire process was handled professionally.'],
            ['make' => 'Mercedes-Benz', 'model' => 'G63 AMG', 'year' => 2024, 'destination' => 'United Arab Emirates', 'deliveryDate' => '2024-10-28', 'image' => 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&h=533&fit=crop', 'customerName' => 'Ahmed R.', 'testimonial' => 'My third purchase through Destino. Consistently excellent service.'],
            ['make' => 'Toyota', 'model' => 'Hilux Revo', 'year' => 2023, 'destination' => 'Kenya', 'deliveryDate' => '2024-10-10', 'image' => 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=533&fit=crop', 'customerName' => 'David M.', 'testimonial' => 'Exactly what I needed for business. Transparent pricing throughout.'],
            ['make' => 'BMW', 'model' => 'X5 xDrive40i', 'year' => 2023, 'destination' => 'New Zealand', 'deliveryDate' => '2024-09-22', 'image' => 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=533&fit=crop', 'customerName' => 'Tomoko S.', 'testimonial' => 'Passed local compliance on the first attempt. Great communication.'],
            ['make' => 'Nissan', 'model' => 'Patrol Y62', 'year' => 2022, 'destination' => 'Jamaica', 'deliveryDate' => '2024-09-05', 'image' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop', 'customerName' => 'Robert T.', 'testimonial' => null],
            ['make' => 'Toyota', 'model' => 'Land Cruiser Prado', 'year' => 2023, 'destination' => 'Tanzania', 'deliveryDate' => '2024-08-18', 'image' => 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=533&fit=crop', 'customerName' => 'Patrick O.', 'testimonial' => 'High inspection standards and thorough documentation.'],
            ['make' => 'Porsche', 'model' => 'Cayenne S', 'year' => 2023, 'destination' => 'Fiji', 'deliveryDate' => '2024-08-02', 'image' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop', 'customerName' => null, 'testimonial' => null],
            ['make' => 'Toyota', 'model' => 'GR Supra', 'year' => 2023, 'destination' => 'Trinidad and Tobago', 'deliveryDate' => '2024-07-20', 'image' => 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop', 'customerName' => 'Marcus W.', 'testimonial' => null],
            ['make' => 'Lexus', 'model' => 'LX 600', 'year' => 2024, 'destination' => 'Mozambique', 'deliveryDate' => '2024-07-08', 'image' => 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop', 'customerName' => 'Carlos F.', 'testimonial' => 'Premium vehicle delivered in showroom condition. Highly recommended.'],
            ['make' => 'Mercedes-Benz', 'model' => 'C300 AMG Line', 'year' => 2022, 'destination' => 'Papua New Guinea', 'deliveryDate' => '2024-06-25', 'image' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=533&fit=crop', 'customerName' => null, 'testimonial' => null],
            ['make' => 'Honda', 'model' => 'Civic Type R', 'year' => 2024, 'destination' => 'Barbados', 'deliveryDate' => '2024-06-10', 'image' => 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop', 'customerName' => 'Ryan B.', 'testimonial' => 'Sourced exactly the spec I wanted. Great communication throughout.'],
            ['make' => 'Toyota', 'model' => 'Alphard', 'year' => 2024, 'destination' => 'Singapore', 'deliveryDate' => '2024-05-28', 'image' => 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop', 'customerName' => 'Wei L.', 'testimonial' => null],
        ];
    }
}
