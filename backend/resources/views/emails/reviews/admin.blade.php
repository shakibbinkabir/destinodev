<x-mail::message>
# New review pending approval

A customer just submitted a review on `/delivered`. It is hidden from the public site until you approve it.

| Field | Value |
| --- | --- |
| Reviewer | {{ $testimonial->name }} |
| Country | {{ $testimonial->country ?: '—' }} |
| Vehicle | {{ $testimonial->vehicle ?: '—' }} |
| Rating | {{ str_repeat('★', (int) $testimonial->rating) }}{{ str_repeat('☆', max(0, 5 - (int) $testimonial->rating)) }} ({{ $testimonial->rating }}/5) |
| Email (admin only) | {{ $testimonial->email ?: '—' }} |

## Review

> {!! nl2br(e($testimonial->text)) !!}

<x-mail::button :url="$adminUrl" :color="'primary'">
Review in admin
</x-mail::button>

You can also approve or reject in bulk from the Testimonials list.

Thanks,
{{ config('app.name') }}
</x-mail::message>
