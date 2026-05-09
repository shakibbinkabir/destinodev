<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SettingResource\Pages;
use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

/**
 * Per PRD §9.7 the developer can pick between the Filament Spatie Settings
 * plugin or a custom Filament page with grouped key-value editing. We use
 * the resource form-with-grouping approach: each setting is one row; the
 * list page is grouped by the `group` column so non-technical admins find
 * "company.email" alongside the other company fields.
 *
 * The keys themselves are seeded and not user-editable (locking them
 * prevents accidental rename of the API contract). Values, type, group,
 * and label are editable.
 */
class SettingResource extends Resource
{
    protected static ?string $model = Setting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 100;

    protected static ?string $recordTitleAttribute = 'key';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Setting')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('key')
                        ->required()
                        ->maxLength(120)
                        ->disabledOn('edit')
                        ->helperText('Lowercase dot-separated identifier (e.g. company.email). Locked after creation.'),
                    Forms\Components\Select::make('type')
                        ->options([
                            'string' => 'String',
                            'int' => 'Integer',
                            'bool' => 'Boolean',
                            'json' => 'JSON',
                            'url' => 'URL',
                            'email' => 'Email',
                            'phone' => 'Phone',
                        ])
                        ->required()
                        ->default('string'),
                    Forms\Components\TextInput::make('group')
                        ->maxLength(60)
                        ->placeholder('company, social, seo, integrations'),
                    Forms\Components\TextInput::make('label')->maxLength(200),
                    Forms\Components\Textarea::make('value')
                        ->required()
                        ->rows(4)
                        ->columnSpanFull(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->groups([
                Tables\Grouping\Group::make('group')
                    ->label('Group')
                    ->collapsible(),
            ])
            ->defaultGroup('group')
            ->columns([
                Tables\Columns\TextColumn::make('label')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('key')->searchable()->copyable()->color('gray'),
                Tables\Columns\TextColumn::make('value')
                    ->limit(60)
                    ->wrap(),
                Tables\Columns\TextColumn::make('type')->badge(),
            ])
            ->filters([
                SelectFilter::make('group')->options(
                    fn (): array => Setting::query()
                        ->select('group')
                        ->whereNotNull('group')
                        ->distinct()
                        ->orderBy('group')
                        ->pluck('group', 'group')
                        ->all(),
                ),
                SelectFilter::make('type')->options([
                    'string' => 'String', 'int' => 'Integer', 'bool' => 'Boolean',
                    'json' => 'JSON', 'url' => 'URL', 'email' => 'Email', 'phone' => 'Phone',
                ]),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()]),
            ])
            ->defaultSort('key');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSettings::route('/'),
            'create' => Pages\CreateSetting::route('/create'),
            'edit' => Pages\EditSetting::route('/{record}/edit'),
        ];
    }
}
