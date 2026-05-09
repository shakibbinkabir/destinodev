<x-mail::message>
# New inquiry received

A new inquiry was submitted on the public site. Details below.

**Submitted at:** {{ $submittedAtJst }}
**Source:** {{ $inquiry->source }}
**IP address:** {{ $inquiry->ip_address ?? '—' }}

---

## Customer

| Field | Value |
| --- | --- |
| Name | {{ $inquiry->name }} |
| Email | {{ $inquiry->email }} |
| Phone | {{ $inquiry->phone ?: '—' }} |
| Country | {{ $inquiry->country ?: '—' }} |

## Vehicle of interest

@if ($car)
**{{ trim($car->make.' '.$car->model) }}** ({{ $car->year }}) — record #{{ $car->id }}

<x-mail::button :url="$carAdminUrl" :color="'primary'">
Open car in admin
</x-mail::button>
@elseif ($inquiry->car_reference)
Free-text reference: **{{ $inquiry->car_reference }}**
@else
_No specific car referenced — general inquiry._
@endif

## Message

> {!! nl2br(e($inquiry->message)) !!}

---

Reply directly to this email to reach the customer at **{{ $inquiry->email }}**.
A copy is filed under inquiry #{{ $inquiry->id }} in the Filament admin panel.

Thanks,
{{ config('app.name') }}
</x-mail::message>
