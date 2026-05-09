<x-mail::message>
# Thank you for your inquiry

Hello {{ $inquiry->name }},

We have received your message and one of our export specialists at {{ $companyName }} will get back to you within one business day (Monday–Friday, Tokyo time).

@if ($car)
For reference, your inquiry is about **{{ trim($car->make.' '.$car->model) }} ({{ $car->year }})**.
@elseif ($inquiry->car_reference)
For reference, your inquiry is about **{{ $inquiry->car_reference }}**.
@endif

If you would like to reach us sooner, the fastest channels are:

@if ($whatsappUrl)
<x-mail::button :url="$whatsappUrl" :color="'success'">
Chat on WhatsApp
</x-mail::button>
@endif

- Email: {{ $companyEmail }}

Thank you for considering {{ $companyName }} — we look forward to helping you find the right vehicle.

Warm regards,
The {{ $companyName }} export team
</x-mail::message>
