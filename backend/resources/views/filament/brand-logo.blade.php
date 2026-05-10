{{--
    Destino brand logo for the Filament topbar and login page.
    Sourced from the public site (apex domain) so we keep a single asset
    instead of duplicating the file into the API host. config('app.frontend_url')
    is registered in config/app.php so this survives `php artisan config:cache`.
    h-8 = 2rem, matching brandLogoHeight() in AdminPanelProvider.
--}}
<img
    src="{{ rtrim(config('app.frontend_url'), '/') }}/logo-link.png"
    alt="Destino"
    class="h-8 w-auto select-none"
>
