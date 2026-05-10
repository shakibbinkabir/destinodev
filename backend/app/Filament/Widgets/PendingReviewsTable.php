<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\TestimonialResource;
use App\Models\Testimonial;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

/**
 * Pending customer reviews surface so they're not buried under the
 * Testimonials resource. One-click approve/reject from the dashboard.
 */
class PendingReviewsTable extends BaseWidget
{
    protected static ?int $sort = 3;

    protected static ?string $heading = 'Reviews awaiting moderation';

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Testimonial::query()->where('status', 'pending')->latest())
            ->emptyStateHeading('No pending reviews')
            ->emptyStateDescription('You\'re all caught up.')
            ->emptyStateIcon('heroicon-o-check-circle')
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Submitted')
                    ->since()
                    ->tooltip(fn ($record) => $record->created_at?->format('Y-m-d H:i')),
                Tables\Columns\TextColumn::make('name')
                    ->weight('semibold')
                    ->searchable(),
                Tables\Columns\TextColumn::make('country')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('vehicle')
                    ->limit(30)
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('rating')
                    ->formatStateUsing(fn ($state) => str_repeat('★', (int) $state).str_repeat('☆', 5 - (int) $state))
                    ->color('warning'),
                Tables\Columns\TextColumn::make('text')
                    ->label('Review')
                    ->limit(60)
                    ->tooltip(fn ($record) => $record->text),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->icon('heroicon-m-check')
                    ->color('success')
                    ->iconButton()
                    ->requiresConfirmation()
                    ->action(function (Testimonial $record) {
                        $record->update(['status' => 'approved']);
                        Notification::make()->success()->title('Review approved')->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->icon('heroicon-m-x-mark')
                    ->color('danger')
                    ->iconButton()
                    ->requiresConfirmation()
                    ->action(function (Testimonial $record) {
                        $record->update(['status' => 'rejected']);
                        Notification::make()->warning()->title('Review rejected')->send();
                    }),
                Tables\Actions\Action::make('view')
                    ->icon('heroicon-m-arrow-top-right-on-square')
                    ->iconButton()
                    ->url(fn ($record) => TestimonialResource::getUrl('edit', ['record' => $record])),
            ])
            ->paginated(false);
    }
}
