<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Actions\Action;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Arr;

/**
 * Operator-friendly settings page. Replaces the SettingResource CRUD table
 * (which exposed schema concepts like "key", "type", "group" to non-technical
 * users). Each section maps to a real-world concern: company info, contact,
 * social media, SEO, integrations.
 *
 * Storage stays in the settings table via Setting::get/set, so existing
 * consumers (NewInquiryNotification recipient resolution, frontend reads,
 * etc.) keep working without changes.
 *
 * Design notes:
 *   - Field names use dot notation that Filament natively nests into $data.
 *     On save we flatten back via Arr::dot() and call Setting::set() per row.
 *   - The Integrations section is collapsed by default and warning-tinted —
 *     casual users shouldn't accidentally edit a YouTube channel ID.
 *   - "JUMVEA member" is a Toggle so the checkbox value round-trips as 1/0
 *     through Setting::set(), matching the seeded `bool` type.
 */
class Settings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationGroup = 'Settings & Users';
    protected static ?string $navigationLabel = 'Site settings';
    protected static ?int $navigationSort = 10;

    protected static string $view = 'filament.pages.settings';
    protected static ?string $title = 'Site settings';
    protected static ?string $slug = 'settings';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'company' => [
                'name'           => Setting::get('company.name', ''),
                'email'          => Setting::get('company.email', ''),
                'phone'          => Setting::get('company.phone', ''),
                'fax'            => Setting::get('company.fax', ''),
                'whatsapp_url'   => Setting::get('company.whatsapp_url', ''),
                'representative' => Setting::get('company.representative', ''),
                'address'        => Setting::get('company.address', ''),
                'business_hours' => Setting::get('company.business_hours', ''),
            ],
            'social' => [
                'facebook'  => Setting::get('social.facebook', ''),
                'instagram' => Setting::get('social.instagram', ''),
                'youtube'   => Setting::get('social.youtube', ''),
                'linkedin'  => Setting::get('social.linkedin', ''),
                'x'         => Setting::get('social.x', ''),
            ],
            'homepage' => [
                'youtube_enabled'   => (bool) Setting::get('homepage.youtube_enabled', true),
                'facebook_enabled'  => (bool) Setting::get('homepage.facebook_enabled', false),
                'instagram_enabled' => (bool) Setting::get('homepage.instagram_enabled', false),
            ],
            'seo' => [
                'default_meta_title'       => Setting::get('seo.default_meta_title', ''),
                'default_meta_description' => Setting::get('seo.default_meta_description', ''),
            ],
            'integrations' => [
                'youtube_channel_id' => Setting::get('integrations.youtube_channel_id', ''),
            ],
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->statePath('data')
            ->schema([
                Section::make('Company information')
                    ->description('Shown across the public site (footer, contact page, inquiry emails).')
                    ->icon('heroicon-o-building-office-2')
                    ->columns(2)
                    ->schema([
                        TextInput::make('company.name')
                            ->label('Company name')
                            ->required()
                            ->maxLength(120),
                        TextInput::make('company.email')
                            ->label('Email address')
                            ->email()
                            ->required()
                            ->helperText('Inquiries from the contact form are sent here.'),
                        TextInput::make('company.phone')
                            ->label('Phone number')
                            ->tel(),
                        TextInput::make('company.fax')
                            ->label('Fax number')
                            ->tel(),
                        TextInput::make('company.whatsapp_url')
                            ->label('WhatsApp link')
                            ->url()
                            ->placeholder('https://wa.me/81459496777')
                            ->helperText('Full URL including https://'),
                        TextInput::make('company.representative')
                            ->label('Representative name'),
                        Textarea::make('company.address')
                            ->label('Office address')
                            ->rows(2)
                            ->columnSpanFull(),
                        Textarea::make('company.business_hours')
                            ->label('Business hours')
                            ->rows(3)
                            ->columnSpanFull()
                            ->helperText('One line per day. Shown verbatim on the contact page.'),
                    ]),

                Section::make('Social media')
                    ->description('Footer icons link to these, and the homepage Facebook/Instagram sections embed them. Leave a field blank to hide that icon.')
                    ->icon('heroicon-o-share')
                    ->collapsible()
                    ->columns(2)
                    ->schema([
                        TextInput::make('social.facebook')->label('Facebook URL')->url()->placeholder('https://facebook.com/YourPage')->helperText('Your Facebook Page URL — also feeds the homepage Facebook section.'),
                        TextInput::make('social.instagram')->label('Instagram URL')->url()->placeholder('https://instagram.com/yourprofile')->helperText('Your Instagram profile URL — also feeds the homepage Instagram section.'),
                        TextInput::make('social.youtube')->label('YouTube URL')->url()->placeholder('https://youtube.com/...'),
                        TextInput::make('social.linkedin')->label('LinkedIn URL')->url()->placeholder('https://linkedin.com/...'),
                        TextInput::make('social.x')->label('X (Twitter) URL')->url()->placeholder('https://x.com/...'),
                    ]),

                Section::make('Homepage sections')
                    ->description('Show or hide the social sections at the bottom of the homepage. Their content comes from the YouTube channel ID (Integrations) and the Facebook/Instagram URLs (Social media) above.')
                    ->icon('heroicon-o-window')
                    ->collapsible()
                    ->columns(3)
                    ->schema([
                        Toggle::make('homepage.youtube_enabled')
                            ->label('YouTube section')
                            ->helperText('Latest videos from the configured channel.'),
                        Toggle::make('homepage.facebook_enabled')
                            ->label('Facebook section')
                            ->helperText('Embeds the Facebook Page above. Needs a Facebook URL.'),
                        Toggle::make('homepage.instagram_enabled')
                            ->label('Instagram section')
                            ->helperText('Links to the Instagram profile above. Needs an Instagram URL.'),
                    ]),

                Section::make('Search engines (SEO)')
                    ->description('Default page title and description used when a specific page hasn\'t set its own.')
                    ->icon('heroicon-o-magnifying-glass')
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        TextInput::make('seo.default_meta_title')
                            ->label('Default page title')
                            ->maxLength(70)
                            ->helperText('Aim for under 60 characters. Shown in browser tabs and Google.'),
                        Textarea::make('seo.default_meta_description')
                            ->label('Default page description')
                            ->rows(3)
                            ->maxLength(160)
                            ->helperText('Shown in Google search snippets. Aim for 150–160 characters.'),
                    ]),

                Section::make('Integrations')
                    ->description('Advanced — only change these if you know what you\'re doing.')
                    ->icon('heroicon-o-puzzle-piece')
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        TextInput::make('integrations.youtube_channel_id')
                            ->label('YouTube channel ID')
                            ->helperText('Used by the home-page video feed. Format: UC...'),
                    ]),
            ]);
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save changes')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        // Flatten the nested form state back to dotted keys (matches the
        // schema in the settings table). Arr::dot('company.name' => 'X')
        // produces ['company.name' => 'X'].
        foreach (Arr::dot($data) as $key => $value) {
            // Toggle gives us a bool; Setting::set() handles the bool→'0/1'
            // serialization so it round-trips cleanly through the typed get().
            Setting::set($key, $value);
        }

        Notification::make()
            ->success()
            ->title('Settings saved')
            ->body('Your changes are live on the site.')
            ->send();
    }
}
