<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeliveredCarResource\Pages;
use App\Models\DeliveredCar;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class DeliveredCarResource extends Resource
{
    protected static ?string $model = DeliveredCar::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationGroup = 'Vehicles';

    protected static ?int $navigationSort = 20;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Vehicle')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('make')->required()->maxLength(60),
                    Forms\Components\TextInput::make('model')->required()->maxLength(120),
                    Forms\Components\TextInput::make('year')->required()->numeric(),
                ]),

            Forms\Components\Section::make('Customer & destination')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('customer_name')->required()->maxLength(120),
                    Forms\Components\TextInput::make('destination_country')->required()->maxLength(80),
                    Forms\Components\TextInput::make('destination_city')->maxLength(80),
                    Forms\Components\DatePicker::make('delivery_date')->required(),
                ]),

            Forms\Components\Section::make('Image & testimonial')
                ->schema([
                    Forms\Components\FileUpload::make('image_path')
                        ->label('Photo')
                        ->image()
                        ->disk('public')
                        ->directory('delivered')
                        ->required(),
                    Forms\Components\Textarea::make('testimonial_text')
                        ->rows(4)
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Status')->schema([
                Forms\Components\Select::make('status')
                    ->options(['published' => 'Published', 'hidden' => 'Hidden'])
                    ->default('published')
                    ->required(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image_path')->disk('public')->square()->label('Photo'),
                Tables\Columns\TextColumn::make('make')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('model')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('year')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('customer_name')->searchable(),
                Tables\Columns\TextColumn::make('destination_country')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('delivery_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->colors([
                    'success' => 'published',
                    'gray' => 'hidden',
                ]),
            ])
            ->filters([
                SelectFilter::make('destination_country')->options(
                    fn (): array => DeliveredCar::query()
                        ->select('destination_country')
                        ->distinct()
                        ->orderBy('destination_country')
                        ->pluck('destination_country', 'destination_country')
                        ->all(),
                ),
                SelectFilter::make('year')->options(
                    fn (): array => DeliveredCar::query()
                        ->select('year')
                        ->distinct()
                        ->orderBy('year', 'desc')
                        ->pluck('year', 'year')
                        ->all(),
                ),
                SelectFilter::make('status')->options(['published' => 'Published', 'hidden' => 'Hidden']),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('delivery_date', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDeliveredCars::route('/'),
            'create' => Pages\CreateDeliveredCar::route('/create'),
            'edit' => Pages\EditDeliveredCar::route('/{record}/edit'),
        ];
    }
}
