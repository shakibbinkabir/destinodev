<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InquiryResource\Pages;
use App\Models\Inquiry;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class InquiryResource extends Resource
{
    protected static ?string $model = Inquiry::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationGroup = 'Inquiries & Reviews';

    protected static ?int $navigationSort = 10;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::query()->where('status', 'new')->count() ?: null;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Submission')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('name')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('email')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('phone')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('country')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('source')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('car_id')->label('Car ID')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('car_reference')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('ip_address')->disabled()->dehydrated(false),
                    Forms\Components\Textarea::make('message')
                        ->rows(6)
                        ->disabled()
                        ->dehydrated(false)
                        ->columnSpanFull(),
                    Forms\Components\TextInput::make('user_agent')
                        ->disabled()
                        ->dehydrated(false)
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Triage')
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('status')
                        ->options([
                            'new' => 'New',
                            'in_progress' => 'In progress',
                            'replied' => 'Replied',
                            'closed' => 'Closed',
                            'spam' => 'Spam',
                        ])
                        ->required(),
                    Forms\Components\Textarea::make('admin_notes')
                        ->rows(4)
                        ->columnSpanFull(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with('car'))
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Received')
                    ->dateTime('Y-m-d H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('country')->searchable(),
                Tables\Columns\TextColumn::make('car.id')
                    ->label('Car')
                    ->formatStateUsing(fn ($state, Inquiry $record) => $record->car
                        ? "#{$record->car->id} {$record->car->make} {$record->car->model}"
                        : ($record->car_reference ?: '—'))
                    ->url(fn (Inquiry $record) => $record->car_id
                        ? CarResource::getUrl('edit', ['record' => $record->car_id])
                        : null),
                Tables\Columns\TextColumn::make('source')->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'warning' => 'new',
                        'info' => 'in_progress',
                        'success' => 'replied',
                        'gray' => 'closed',
                        'danger' => 'spam',
                    ]),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'new' => 'New',
                    'in_progress' => 'In progress',
                    'replied' => 'Replied',
                    'closed' => 'Closed',
                    'spam' => 'Spam',
                ]),
                SelectFilter::make('source')->options([
                    'contact_page' => 'Contact page',
                    'single_car' => 'Single car',
                    'homepage' => 'Homepage',
                    'footer' => 'Footer',
                    'other' => 'Other',
                ]),
                Filter::make('received_between')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('to'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
                        ->when($data['to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('mark_replied')
                    ->label('Mark replied')
                    ->icon('heroicon-o-check-circle')
                    ->action(fn (Inquiry $record) => $record->update(['status' => 'replied'])),
                Tables\Actions\Action::make('mark_closed')
                    ->label('Mark closed')
                    ->icon('heroicon-o-archive-box')
                    ->action(fn (Inquiry $record) => $record->update(['status' => 'closed'])),
                Tables\Actions\Action::make('mark_spam')
                    ->label('Mark spam')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->action(fn (Inquiry $record) => $record->update(['status' => 'spam'])),
                Tables\Actions\Action::make('whatsapp')
                    ->label('Open WhatsApp')
                    ->icon('heroicon-o-chat-bubble-left-right')
                    ->color('success')
                    ->visible(fn (Inquiry $record) => filled($record->phone))
                    ->url(fn (Inquiry $record) => 'https://wa.me/'.preg_replace('/[^0-9]/', '', (string) $record->phone), true),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInquiries::route('/'),
            'create' => Pages\CreateInquiry::route('/create'),
            'edit' => Pages\EditInquiry::route('/{record}/edit'),
        ];
    }
}
