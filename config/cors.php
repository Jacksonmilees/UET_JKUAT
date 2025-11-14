<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Paths
    |--------------------------------------------------------------------------
    | The paths that should be subject to CORS handling. Wildcards (*) are supported.
    */
    'paths' => [
        'api/*',              // Covers all API routes
        'api/v1/*',           // Covers v1 prefixed API routes
        'withdrawal/*',       // Explicitly covers your withdrawal routes (e.g., /withdrawal/otp)
        'api/v1/accounts/*',  // Covers account-related API routes
        'api/v1/payments/*',  // Covers payment-related API routes
        'api/v1/transactions/*', // Covers transaction-related API routes
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed Methods
    |--------------------------------------------------------------------------
    | HTTP methods allowed for CORS requests. '*' can be used to allow all methods.
    */
    'allowed_methods' => [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS', // Required for preflight requests
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    | Origins (domains) allowed to make requests. Wildcards (*) can be used cautiously.
    */
    'allowed_origins' => [
        'https://missions.moutjkuatministry.cloud',
        'https://project.moutjkuatministry.cloud',
        'https://dash.moutjkuatministry.cloud',
        'https://*.moutjkuatministry.cloud',
        'http://localhost:3000',
        'http://localhost:5173',  // Vite dev server
        'http://localhost:8000',  // Laravel dev server
        'http://195.179.229.205:3000',
        'https://uet-jkuat.onrender.com',  // Backend domain
        'https://uet-jkuat.vercel.app',  // Frontend on Vercel
        'https://uetjkuat-54286e10a43b.herokuapp.com',  // Heroku deployment
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins Patterns
    |--------------------------------------------------------------------------
    | Regex patterns for dynamic origin matching. Useful for subdomains.
    */
    'allowed_origins_patterns' => [
        '/^https:\/\/([a-z0-9-]+\.)?moutjkuatministry\.cloud$/', // Matches subdomains of moutjkuatministry.cloud
        '/^https:\/\/([a-z0-9-]+\.)?onrender\.com$/', // Matches all Render subdomains
        '/^https:\/\/([a-z0-9-]+\.)?vercel\.app$/', // Matches all Vercel subdomains
        '/^https:\/\/([a-z0-9-]+\.)?herokuapp\.com$/', // Matches all Heroku subdomains
        '/^http:\/\/localhost:\d+$/', // Matches localhost with any port
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    | Headers clients can send in requests. '*' can be used to allow all headers.
    */
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'X-XSRF-TOKEN',
        'X-CSRF-TOKEN',
        'Accept',
        'Origin',
        'x-api-key', // Added for API key authentication
        'X-API-Key', // Alternative case
    ],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    | Headers exposed to the client in the response.
    */
    'exposed_headers' => [],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    | How long (in seconds) the preflight response can be cached by the client.
    */
    'max_age' => 60 * 60 * 24, // 24 hours

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    | Whether the response can include credentials (e.g., cookies, Authorization headers).
    */
    'supports_credentials' => true,
];