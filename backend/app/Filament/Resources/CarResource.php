<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CarResource\Pages;
use App\Models\Car;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class CarResource extends Resource
{
    protected static ?string $model = Car::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Basic')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('make')
                        ->required()
                        ->maxLength(60)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('model')
                        ->required()
                        ->maxLength(120)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('year')
                        ->required()
                        ->numeric()
                        ->minValue(1980)
                        ->maxValue((int) date('Y') + 1)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('price_jpy')
                        ->label('Price (JPY)')
                        ->required()
                        ->numeric()
                        ->prefix('¥')
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('condition')
                        ->required()
                        ->maxLength(40)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\Select::make('source')
                        ->options(['inhouse' => 'In-house', 'api' => 'API (One-Price Stock)'])
                        ->required()
                        ->default('inhouse')
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('external_id')
                        ->label('External ID')
                        ->maxLength(100)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated()
                        ->visible(fn (Get $get) => $get('source') === 'api' || $get('external_id')),
                ]),

            Forms\Components\Section::make('Specs')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('mileage_km')
                        ->label('Mileage (km)')
                        ->required()
                        ->numeric()
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\Select::make('fuel')
                        ->options([
                            'gasoline' => 'Gasoline',
                            'hybrid' => 'Hybrid',
                            'ev' => 'EV',
                            'diesel' => 'Diesel',
                        ])
                        ->required()
                        ->live()
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\Select::make('transmission')
                        ->options([
                            'automatic' => 'Automatic',
                            'manual' => 'Manual',
                            'cvt' => 'CVT',
                        ])
                        ->required()
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('body_type')
                        ->required()
                        ->maxLength(60)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('engine_size')
                        ->maxLength(20)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('color')
                        ->required()
                        ->maxLength(40)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\Select::make('drive_type')
                        ->options([
                            '2wd' => '2WD',
                            '4wd' => '4WD',
                            'awd' => 'AWD',
                            'fwd' => 'FWD',
                            'rwd' => 'RWD',
                        ])
                        ->required()
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('seats')
                        ->required()
                        ->numeric()
                        ->minValue(1)
                        ->maxValue(20)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('doors')
                        ->required()
                        ->numeric()
                        ->minValue(1)
                        ->maxValue(8)
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                ]),

            Forms\Components\Section::make('EV / Hybrid')
                ->columns(2)
                ->visible(fn (Get $get) => in_array($get('fuel'), ['ev', 'hybrid'], true))
                ->schema([
                    Forms\Components\TextInput::make('battery_capacity')
                        ->maxLength(40)
                        ->placeholder('e.g. 60 kWh')
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                    Forms\Components\TextInput::make('motor_output')
                        ->maxLength(40)
                        ->placeholder('e.g. 110 kW')
                        ->disabled(fn (?Car $record) => $record?->source === 'api')
                        ->dehydrated(),
                ]),

            Forms\Components\Section::make('Marketing')
                ->columns(3)
                ->schema([
                    Forms\Components\Toggle::make('featured')
                        ->required(),
                    Forms\Components\TextInput::make('badge')
                        ->maxLength(40)
                        ->placeholder('New Arrival, Hot Deal, …'),
                    Forms\Components\Textarea::make('description')
                        ->required()
                        ->columnSpanFull()
                        ->rows(6),
                ]),

            Forms\Components\Section::make('Images')
                ->schema([
                    Forms\Components\Repeater::make('images')
                        ->relationship()
                        ->schema([
                            Forms\Components\FileUpload::make('path')
                                ->image()
                                ->disk('public')
                                ->directory('cars')
                                ->required()
                                ->columnSpan(2),
                            Forms\Components\Toggle::make('is_primary')
                                ->label('Primary'),
                        ])
                        ->columns(3)
                        ->orderColumn('sort_order')
                        ->reorderable()
                        ->reorderableWithButtons()
                        ->collapsible()
                        ->itemLabel(fn (array $state): ?string => $state['path'] ?? null)
                        ->defaultItems(0)
                        ->addActionLabel('Add image'),
                ]),

            Forms\Components\Section::make('Status')
                ->schema([
                    Forms\Components\Select::make('status')
                        ->options([
                            'available' => 'Available',
                            'sold' => 'Sold',
                            'hidden' => 'Hidden',
                        ])
                        ->required()
                        ->default('available'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['primaryImage', 'images']))
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->label('Thumb')
                    ->disk('public')
                    ->state(function (Car $record): ?string {
                        $primary = $record->primaryImage->first() ?? $record->images->first();

                        return $primary?->path;
                    })
                    ->square(),
                Tables\Columns\TextColumn::make('make')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('model')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('year')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('price_jpy')
                    ->label('Price (JPY)')
                    ->money('JPY')
                    ->sortable(),
                Tables\Columns\TextColumn::make('source')
                    ->badge()
                    ->colors([
                        'primary' => 'inhouse',
                        'warning' => 'api',
                    ]),
                Tables\Columns\IconColumn::make('featured')
                    ->boolean(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'success' => 'available',
                        'gray' => 'sold',
                        'danger' => 'hidden',
                    ]),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('source')->options([
                    'inhouse' => 'In-house',
                    'api' => 'API',
                ]),
                SelectFilter::make('status')->options([
                    'available' => 'Available',
                    'sold' => 'Sold',
                    'hidden' => 'Hidden',
                ]),
                TernaryFilter::make('featured'),
                SelectFilter::make('fuel')->options([
                    'gasoline' => 'Gasoline',
                    'hybrid' => 'Hybrid',
                    'ev' => 'EV',
                    'diesel' => 'Diesel',
                ]),
                SelectFilter::make('transmission')->options([
                    'automatic' => 'Automatic',
                    'manual' => 'Manual',
                    'cvt' => 'CVT',
                ]),
                SelectFilter::make('body_type')->options(
                    fn (): array => Car::query()
                        ->select('body_type')
                        ->distinct()
                        ->orderBy('body_type')
                        ->pluck('body_type', 'body_type')
                        ->all(),
                ),
                Tables\Filters\Filter::make('year_range')
                    ->form([
                        Forms\Components\TextInput::make('year_from')->numeric(),
                        Forms\Components\TextInput::make('year_to')->numeric(),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['year_from'] ?? null, fn ($q, $v) => $q->where('year', '>=', $v))
                            ->when($data['year_to'] ?? null, fn ($q, $v) => $q->where('year', '<=', $v));
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('mark_featured')
                        ->label('Mark featured')
                        ->icon('heroicon-o-star')
                        ->action(fn ($records) => $records->each->update(['featured' => true]))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('mark_sold')
                        ->label('Mark sold')
                        ->icon('heroicon-o-banknotes')
                        ->action(fn ($records) => $records->each->update(['status' => 'sold']))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('mark_hidden')
                        ->label('Mark hidden')
                        ->icon('heroicon-o-eye-slash')
                        ->action(fn ($records) => $records->each->update(['status' => 'hidden']))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('updated_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCars::route('/'),
            'create' => Pages\CreateCar::route('/create'),
            'edit' => Pages\EditCar::route('/{record}/edit'),
        ];
    }
}
