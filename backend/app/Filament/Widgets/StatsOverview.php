<?php

namespace App\Filament\Widgets;

use App\Models\Car;
use App\Models\DeliveredCar;
use App\Models\Inquiry;
use App\Models\Testimonial;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * Top-of-dashboard KPI strip. Replaces the default FilamentInfoWidget so
 * the first thing an admin sees is their own data, not a Filament advert.
 *
 * The four metrics are deliberately the ones an export operator needs to
 * watch daily: how much inventory is live, how many leads need a reply,
 * how many reviews are awaiting moderation, and the historical sold count.
 */
class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        return [
            Stat::make('Cars in Stock', Car::where('status', 'available')->count())
                ->description('Listed publicly on /stock')
                ->descriptionIcon('heroicon-m-rectangle-stack')
                ->color('primary'),

            Stat::make('New Inquiries', Inquiry::where('status', 'new')->count())
                ->description('Awaiting first reply')
                ->descriptionIcon('heroicon-m-envelope')
                ->color(Inquiry::where('status', 'new')->count() > 0 ? 'warning' : 'success'),

            Stat::make('Pending Reviews', Testimonial::where('status', 'pending')->count())
                ->description('Customer testimonials to moderate')
                ->descriptionIcon('heroicon-m-star')
                ->color(Testimonial::where('status', 'pending')->count() > 0 ? 'warning' : 'success'),

            Stat::make('Delivered Cars', DeliveredCar::count())
                ->description('Cumulative export count')
                ->descriptionIcon('heroicon-m-truck')
                ->color('success'),
        ];
    }
}
