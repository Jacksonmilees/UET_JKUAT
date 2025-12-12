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
     // Environment
     'api' => [
        'key' => env('API_KEY'),
     ],
     'env' => env('MPESA_ENV', 'production'),

     // Credentials
     'consumer_key' => env('MPESA_CONSUMER_KEY'),
     'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
     'shortcode' => env('MPESA_SHORTCODE'),
     'passkey' => env('MPESA_PASSKEY'),
 
     // Callback secret for additional security
     'callback_secret' => env('MPESA_CALLBACK_SECRET'),
 
     // Notification numbers
     'treasurer_numbers' => [
         '+254708405553',
         '+254706400432',
         '+254794711258'
     ],
     
  
     'whatsapp_web' => [
    'base_url' => env('WHATSAPP_WEB_API_URL', 'http://195.179.229.205:3000/'),
],
     // Transaction types
     'transaction_types' => [
         'customer_paybill' => 'CustomerPayBillOnline',
         'buygoods' => 'CustomerBuyGoodsOnline',
     ],
 
     // URLs
     'validation_url' => env('MPESA_VALIDATION_URL'),
     'confirmation_url' => env('MPESA_CONFIRMATION_URL'),
 
    'mpesa' => [
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'passkey' => env('MPESA_PASSKEY'),
        'shortcode' => env('MPESA_SHORTCODE'),
        'env' => env('MPESA_ENV', 'production'), // 'sandbox' or 'production'
    ],
    // config/services.php
  'credofaster' => [
    'url' => env('CREDOFASTER_API_URL', 'https://api.partner.credofaster.co.ke'),
    'api_key' => env('CREDOFASTER_API_KEY'),
    'client_id' => env('CREDOFASTER_CLIENT_ID'),
    'partner_id' => env('CREDOFASTER_PARTNER_ID'),
    ],
    'whatsapp' => [
        'url' => env('WHATSAPP_API_URL'),
    ],
    'whatsapp_web' => [
        'base_url' => env('WHATSAPP_WEB_API_URL', env('OTP_SERVICE_URL', 'http://localhost:5001')),
    ],
'sms' => [
    'api_url' => env('SMS_API_URL', 'https://blessedtexts.com/api/sms/v1/sendsms'),
    'api_key' => env('SMS_API_KEY'),
    'sender_id' => env('SMS_SENDER_ID', 'FERRITE')
],
    'decode_hash' => [
        'url' => env('DECODE_HASH_API_URL'),
        'api_key' => env('DECODE_HASH_API_KEY'),
    ],
    
    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

  'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'model' => env('GEMINI_MODEL', 'gemini-2.0-flash-exp'),
        'enabled' => env('GEMINI_ENABLED', false),
        'timeout' => env('GEMINI_TIMEOUT', 30),
        'rate_limit' => [
            'max_requests' => env('GEMINI_RATE_LIMIT_REQUESTS', 100),
            'per_minutes' => env('GEMINI_RATE_LIMIT_MINUTES', 60),
        ],
        'fraud_detection' => [
            'enabled' => env('GEMINI_FRAUD_DETECTION_ENABLED', true),
            'threshold' => env('GEMINI_FRAUD_THRESHOLD', 0.7),
        ],
        'anomaly_detection' => [
            'enabled' => env('GEMINI_ANOMALY_DETECTION_ENABLED', true),
            'threshold' => env('GEMINI_ANOMALY_THRESHOLD', 0.8),
        ],
        'smart_matching' => [
            'enabled' => env('GEMINI_SMART_MATCHING_ENABLED', true),
            'confidence_threshold' => env('GEMINI_MATCHING_CONFIDENCE', 0.7),
        ]
    ],  
];
