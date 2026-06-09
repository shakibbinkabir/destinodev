<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'exchange_rate' => [
        // USD→JPY is sourced from MUFG Bank's published TT rates and applying
        // `rate = USD T.T.B. - offset` (client requirement; deviates from
        // PRD §6.4.4 — see App\Services\ExchangeRateService docblock).
        //
        // We fetch the JSON-ish data feed, NOT the kawase.html page: that page
        // renders every rate cell as "----" and only fills them in client-side
        // from this same feed (kawase_utf8.js). USD T.T.B. is keyed G001TTBZ.
        'mufg_url' => env('EXCHANGE_RATE_MUFG_URL', 'https://www.bk.mufg.jp/gdocs/kinri/kinri_data_utf8.js'),
        'ttb_offset' => (float) env('EXCHANGE_RATE_TTB_OFFSET', 4),
    ],

    'youtube' => [
        'channel_id' => env('YOUTUBE_CHANNEL_ID', 'UC9r_ugFs9RL4OkeEAwztQ7g'),
    ],

    'one_price_stock' => [
        'base_url' => env('ONE_PRICE_STOCK_API_URL', 'https://jdmauction.live/oneprice/api'),
        'username' => env('ONE_PRICE_STOCK_API_USERNAME'),
        'key' => env('ONE_PRICE_STOCK_API_KEY'),
        // CSV of maker.company_id values to iterate during scheduled sync.
        // See database/data/oneprice/makers.json for the lookup (e.g. 9 = TOYOTA).
        'makers' => env('ONE_PRICE_STOCK_MAKERS'),
    ],

];
