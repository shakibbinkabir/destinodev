{{--
    Destino brand mark for the Filament topbar and login page.
    Uses currentColor + Filament's primary-* utility classes so the mark
    adapts to light/dark mode automatically. Wordmark uses tight letter-
    spacing and weight to read as a brand, not a heading.
--}}
<div class="fi-brand flex items-center gap-2.5 leading-none select-none">
    <svg class="size-7 shrink-0 text-primary-600 dark:text-primary-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {{-- Two stacked chevrons forming a "destination" arrow / motion mark --}}
        <path d="M6 10 L16 20 L26 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 18 L16 28 L26 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>
    </svg>
    <span class="text-xl font-extrabold tracking-[0.18em] text-gray-900 dark:text-white">
        DESTINO
    </span>
    <span class="ms-0.5 inline-block size-1.5 rounded-full bg-primary-500"></span>
</div>
