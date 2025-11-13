<?php

return [
    'callback_secret' => env('MPESA_CALLBACK_SECRET', null),
    'log_channel' => env('MPESA_LOG_CHANNEL', 'mpesa'),
    'env' => env('MPESA_ENV', 'production'),
    'consumer_key' => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
    'shortcode' => env('MPESA_SHORTCODE'),
    'passkey' => env('MPESA_PASSKEY'),
   'shortcode' => env('MPESA_SHORTCODE', '4131985'),
   'treasurer_numbers' => env('MPESA_TREASURER_NUMBERS', ''),
   'callback_url' => env('MPESA_CALLBACK_URL'),
   'default_account_reference' => env('MPESA_DEFAULT_ACCOUNT', 'MPESA_RECEIPTS'),
   'default_account_type_id' => 1,  // Set appropriate ID
    'default_account_subtype_id' => 1,
    'initiator' => env('MPESA_INITIATOR'),
    'security_credential' => env('MPESA_SECURITY_CREDENTIAL'),
    'party_a' => env('MPESA_PARTY_A'),
    'base_url' => env('MPESA_ENVIRONMENT', 'sandbox') === 'production' 
        ? 'https://api.safaricom.co.ke' 
        : 'https://sandbox.safaricom.co.ke',
  
  'b2c' => [
        'url' => env('MPESA_B2C_URL', 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'),
        'token_url' => env('MPESA_TOKEN_URL', 'https://api.safaricom.co.ke/oauth/v1/generate'),
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'initiator_name' => env('MPESA_B2C_INITIATOR_NAME'),
        'security_credential' => env('MPESA_B2C_SECURITY_CREDENTIAL'),
        'shortcode' => env('MPESA_B2C_SHORTCODE'),
        'result_url' => env('MPESA_B2C_RESULT_URL'),
        'timeout_url' => env('MPESA_B2C_TIMEOUT_URL')
    ],
    'default_account_type_id' => env('MPESA_DEFAULT_ACCOUNT_TYPE_ID', 1),
    'default_account_subtype_id' => env('MPESA_DEFAULT_ACCOUNT_SUBTYPE_ID', 1),
    'default_account_reference' => env('MPESA_DEFAULT_ACCOUNT_REFERENCE', 'MPESA_RECEIPTS'),
];

// Add to config/logging.php channels array
