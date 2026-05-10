<?php

namespace App\Providers\Filament;

use App\Filament\Widgets\PendingReviewsTable;
use App\Filament\Widgets\RecentInquiriesTable;
use App\Filament\Widgets\StatsOverview;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\MaxWidth;
use Filament\View\PanelsRenderHook;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()

            // ----- Brand identity -----
            ->brandName('Destino')
            ->brandLogo(fn () => view('filament.brand-logo'))
            ->brandLogoHeight('2rem')
            ->favicon(asset('favicon.ico'))
            ->colors([
                // Primary palette is generated from the Destino navy #32498F.
                // Filament's Color::hex() expands a single hex into the full
                // 50-950 Tailwind-style scale that the panel needs.
                'primary' => Color::hex('#32498F'),
                'gray'    => Color::Slate,
            ])

            // ----- Layout -----
            ->sidebarCollapsibleOnDesktop()
            ->maxContentWidth(MaxWidth::Full)
            ->navigationGroups([
                NavigationGroup::make('Vehicles')->icon('heroicon-o-rectangle-stack'),
                NavigationGroup::make('Inquiries & Reviews')->icon('heroicon-o-inbox'),
                NavigationGroup::make('Website')->icon('heroicon-o-document-text'),
                NavigationGroup::make('Settings & Users')->icon('heroicon-o-cog-6-tooth')->collapsed(),
            ])

            // ----- Discovery -----
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                // We deliberately drop FilamentInfoWidget — it's the default
                // "made with Filament" advert and is the loudest tell that
                // a panel is unstyled. AccountWidget stays for the profile chip.
                Widgets\AccountWidget::class,
                StatsOverview::class,
                RecentInquiriesTable::class,
                PendingReviewsTable::class,
            ])

            // ----- Render hooks -----
            // Inject our custom CSS into <head> on every panel page. Used in
            // place of a compiled Vite theme because this host has no npm —
            // see deployment.md. Keep the hooked CSS minimal and stable.
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): string => view('filament.custom-styles')->render(),
            )
            // "View site" button at the right end of the topbar so admins can
            // jump to the public site they're managing without re-typing the URL.
            ->renderHook(
                PanelsRenderHook::USER_MENU_BEFORE,
                fn (): string => '<a href="'.config('app.frontend_url').'" target="_blank" rel="noopener" '
                    .'class="fi-icon-btn flex items-center justify-center rounded-lg p-2 text-gray-400 transition '
                    .'hover:bg-gray-50 hover:text-primary-600 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-primary-400" '
                    .'title="Open public site">'
                    .'<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
                    .'<path d="M14 4h6v6"/><path d="M10 14L21 3"/><path d="M19 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6"/>'
                    .'</svg></a>',
            )

            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->plugins([
                FilamentShieldPlugin::make(),
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
