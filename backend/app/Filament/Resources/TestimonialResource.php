<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestimonialResource\Pages;
use App\Models\Testimonial;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';

    protected static ?string $navigationGroup = 'Inquiries & Reviews';

    protected static ?int $navigationSort = 20;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::query()->where('status', 'pending')->count() ?: null;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Customer')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('name')->required()->maxLength(120),
                    Forms\Components\TextInput::make('country')->maxLength(80),
                    Forms\Components\TextInput::make('vehicle')->maxLength(120),
                    Forms\Components\TextInput::make('email')
                        ->email()
                        ->maxLength(180)
                        ->helperText('Admin only — never shown publicly.'),
                ]),

            Forms\Components\Section::make('Review')
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('rating')
                        ->options([1 => '★', 2 => '★★', 3 => '★★★', 4 => '★★★★', 5 => '★★★★★'])
                        ->required(),
                    Forms\Components\Toggle::make('featured')
                        ->helperText('Featured reviews appear in the homepage slider.'),
                    Forms\Components\Textarea::make('text')->required()->rows(6)->columnSpanFull(),
                    Forms\Components\FileUpload::make('image_path')
                        ->image()
                        ->disk('public')
                        ->directory('testimonials')
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Moderation')->schema([
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ])
                    ->required()
                    ->default('pending'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger' => 'rejected',
                    ]),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('country')->searchable(),
                Tables\Columns\TextColumn::make('rating')
                    ->formatStateUsing(fn (int $state) => str_repeat('★', $state).str_repeat('☆', 5 - $state)),
                Tables\Columns\TextColumn::make('vehicle')->limit(30),
                Tables\Columns\TextColumn::make('created_at')->dateTime('Y-m-d')->sortable(),
                Tables\Columns\IconColumn::make('featured')->boolean(),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                ]),
                TernaryFilter::make('featured'),
                SelectFilter::make('rating')->options([
                    1 => '1 star', 2 => '2 stars', 3 => '3 stars', 4 => '4 stars', 5 => '5 stars',
                ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn (Testimonial $record) => $record->status !== 'approved')
                    ->action(function (Testimonial $record): void {
                        $record->update(['status' => 'approved']);
                        Notification::make()
                            ->title('Review approved')
                            ->body("{$record->name}'s review is now visible on the public site.")
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Reject this review?')
                    ->modalDescription('Rejected reviews stay in the database for audit but never appear on the public site. You can re-approve later.')
                    ->visible(fn (Testimonial $record) => $record->status !== 'rejected')
                    ->action(function (Testimonial $record): void {
                        $record->update(['status' => 'rejected']);
                        Notification::make()
                            ->title('Review rejected')
                            ->body("{$record->name}'s review will not be shown on the public site.")
                            ->warning()
                            ->send();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('approve')
                        ->label('Approve')
                        ->icon('heroicon-o-check')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                $record->update(['status' => 'approved']);
                                $count++;
                            }
                            Notification::make()
                                ->title("Approved {$count} review(s)")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('reject')
                        ->label('Reject')
                        ->icon('heroicon-o-x-mark')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->modalHeading('Reject the selected reviews?')
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                $record->update(['status' => 'rejected']);
                                $count++;
                            }
                            Notification::make()
                                ->title("Rejected {$count} review(s)")
                                ->warning()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('mark_featured')
                        ->label('Mark featured')
                        ->icon('heroicon-o-star')
                        ->action(fn ($records) => $records->each->update(['featured' => true]))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTestimonials::route('/'),
            'create' => Pages\CreateTestimonial::route('/create'),
            'edit' => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
