<?php

namespace Database\Seeders;

use App\Models\PageContent;
use Illuminate\Database\Seeder;

/**
 * Seeds page_contents for the about / shipping / contact slugs.
 *
 * The body copy was hand-extracted from the React JSX pages
 * (src/pages/AboutPage.jsx, ShippingPage.jsx, ContactPage.jsx). The
 * Contact page is mostly form + dynamic data, so we seed a short
 * intro paragraph; the form itself is rendered by the SPA.
 *
 * See BLOCKERS.md — "Page copy migration from JSX into DB" — for the
 * follow-up to revisit the wording with the client.
 */
class PageContentsSeeder extends Seeder
{
    public function run(): void
    {
        $about = <<<'MD'
Founded in 1995 in Yokohama, Japan, DESTINO Corporation has grown from a small local operation to one of Japan's respected vehicle export companies. For nearly three decades, we have been connecting buyers worldwide with quality Japanese vehicles.

Our mission is straightforward: to provide reliable, high-quality vehicles to international clients with complete transparency in pricing, condition, and process. We believe the best business relationships are built on trust, consistent communication, and delivering exactly what we promise.

Operating from our headquarters in Yokohama, we have access to Japan's largest vehicle auction networks and maintain strong relationships with dealers across the country. This network allows us to source virtually any make and model our clients require.
MD;

        $shipping = <<<'MD'
## Shipping Guide & Rates

Download or view our shipping information document for details on rates, transit times, and delivery options to your country.

We offer both Roll-on/Roll-off (RoRo) and container shipping to ports worldwide. Transit times and rates depend on the destination port. Our team will prepare a complete cost breakdown including freight, insurance, and documentation as part of your quote.

### Useful Shipping Resources
- **SeaRates** — check shipping distances and transit times
- **Freightos** — compare international freight rates
- **Shippio** — Japan-based freight forwarding & tracking
MD;

        $contact = <<<'MD'
## Send Us an Inquiry

Fill out the form on this page and our team will respond within 24 hours during business days.

You can also reach us by phone, fax, email, or WhatsApp using the details listed in the sidebar. Our Yokohama head office is open Tuesday through Saturday 10:00–19:00, weekends and holidays 10:00–18:00, and is closed on Mondays.
MD;

        PageContent::updateOrCreate(
            ['slug' => 'about'],
            [
                'title' => 'About DESTINO',
                'body' => $about,
                'meta_title' => 'About DESTINO',
                'meta_description' => 'Vehicle exporter from Yokohama, Japan, since 1995. Connecting global buyers with quality Japanese cars.',
                'extras' => null,
            ],
        );

        PageContent::updateOrCreate(
            ['slug' => 'shipping'],
            [
                'title' => 'Shipping Information',
                'body' => $shipping,
                'meta_title' => 'Shipping Information — DESTINO',
                'meta_description' => 'Shipping rates, transit times, and delivery options for DESTINO vehicle exports.',
                'extras' => ['shipping_pdf_path' => null],
            ],
        );

        PageContent::updateOrCreate(
            ['slug' => 'contact'],
            [
                'title' => 'Contact Us',
                'body' => $contact,
                'meta_title' => 'Contact DESTINO',
                'meta_description' => 'Get in touch with DESTINO Corporation in Yokohama, Japan.',
                'extras' => null,
            ],
        );
    }
}
