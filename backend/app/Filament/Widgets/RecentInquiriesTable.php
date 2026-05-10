<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\InquiryResource;
use App\Models\Inquiry;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

/**
 * Latest 10 inquiries on the dashboard with quick access to the full record.
 * Status is shown as a colored badge so unanswered leads visually stand out.
 */
class RecentInquiriesTable extends BaseWidget
{
    protected static ?int $sort = 2;

    protected static ?string $heading = 'Recent inquiries';

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Inquiry::query()->with('car')->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Received')
                    ->since()
                    ->tooltip(fn ($record) => $record->created_at?->format('Y-m-d H:i'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->weight('semibold'),
                Tables\Columns\TextColumn::make('email')
                    ->copyable()
                    ->copyMessage('Email copied'),
                Tables\Columns\TextColumn::make('car.make')
                    ->label('Vehicle')
                    ->formatStateUsing(fn ($record) => $record->car
                        ? trim($record->car->make.' '.$record->car->model)
                        : ($record->car_reference ?: '—'))
                    ->limit(40),
                Tables\Columns\TextColumn::make('country')
                    ->label('Country')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'new'         => 'warning',
                        'in_progress' => 'info',
                        'replied'     => 'success',
                        'closed'      => 'gray',
                        'spam'        => 'danger',
                        default       => 'gray',
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->label('Open')
                    ->icon('heroicon-m-arrow-top-right-on-square')
                    ->url(fn ($record) => InquiryResource::getUrl('edit', ['record' => $record]))
                    ->iconButton(),
            ])
            ->paginated(false);
    }
}
