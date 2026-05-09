<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PageContentResource\Pages;
use App\Models\PageContent;
use Filament\Forms;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PageContentResource extends Resource
{
    protected static ?string $model = PageContent::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Page')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('slug')
                        ->required()
                        ->maxLength(60)
                        ->disabledOn('edit')
                        ->helperText('Lowercase identifier, used in API URLs (about, shipping, contact, ...).'),
                    Forms\Components\TextInput::make('title')->required()->maxLength(200),
                ]),

            Forms\Components\Section::make('Body')
                ->schema([
                    MarkdownEditor::make('body')
                        ->required()
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('SEO')
                ->columns(2)
                ->collapsible()
                ->schema([
                    Forms\Components\TextInput::make('meta_title')->maxLength(200),
                    Forms\Components\TextInput::make('meta_description')->maxLength(300),
                ]),

            Forms\Components\Section::make('Shipping PDF')
                ->visible(fn (Get $get) => $get('slug') === 'shipping')
                ->schema([
                    Forms\Components\FileUpload::make('extras.shipping_pdf_path')
                        ->label('Shipping PDF')
                        ->disk('public')
                        ->directory('shipping')
                        ->acceptedFileTypes(['application/pdf'])
                        ->helperText('Uploaded once. The public /api/v1/shipping-pdf endpoint redirects to the file.'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('slug')->badge()->searchable(),
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime('Y-m-d H:i')->sortable(),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('slug');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPageContents::route('/'),
            'create' => Pages\CreatePageContent::route('/create'),
            'edit' => Pages\EditPageContent::route('/{record}/edit'),
        ];
    }
}
