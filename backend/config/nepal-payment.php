<?php

return [

    /*
    |--------------------------------------------------------------------------
    | eSewa Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for eSewa payment gateway.
    | Get your merchant code from: https://esewa.com.np
    |
    */
    'esewa' => [
        'merchant_code' => env('ESEWA_MERCHANT_CODE', 'EPAYTEST'),
        'test_url' => 'https://uat.esewa.com.np/epay/main',
        'live_url' => 'https://esewa.com.np/epay/main',
        'verify_test_url' => 'https://uat.esewa.com.np/epay/transrec',
        'verify_live_url' => 'https://esewa.com.np/epay/transrec',
        'environment' => env('ESEWA_ENVIRONMENT', 'test'), // 'test' or 'live'
    ],

    /*
    |--------------------------------------------------------------------------
    | Khalti Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Khalti payment gateway.
    | Get your API keys from: https://admin.khalti.com (live) or https://test-admin.khalti.com (test)
    |
    */
    'khalti' => [
        'secret_key' => env('KHALTI_SECRET_KEY', ''),
        'public_key' => env('KHALTI_PUBLIC_KEY', ''),
        'test_url' => 'https://a.khalti.com/api/v2/',
        'live_url' => 'https://khalti.com/api/v2/',
        'environment' => env('KHALTI_ENVIRONMENT', 'test'), // 'test' or 'live'
    ],

    /*
    |--------------------------------------------------------------------------
    | Fonepay Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Fonepay payment gateway.
    | Get your credentials from Fonepay.
    |
    */
    'fonepay' => [
        'merchant_code' => env('FONEPAY_MERCHANT_CODE', ''),
        'secret_key' => env('FONEPAY_SECRET_KEY', ''),
        'test_url' => 'https://dev-clientapi.fonepay.com/api/merchantRequest',
        'live_url' => 'https://clientapi.fonepay.com/api/merchantRequest',
        'verify_test_url' => 'https://dev-clientapi.fonepay.com/api/merchantRequest/verificationMerchant',
        'verify_live_url' => 'https://clientapi.fonepay.com/api/merchantRequest/verificationMerchant',
        'environment' => env('FONEPAY_ENVIRONMENT', 'test'), // 'test' or 'live'
    ],

    /*
    |--------------------------------------------------------------------------
    | Route Configuration
    |--------------------------------------------------------------------------
    |
    | Configure route prefix and middleware for payment routes.
    |
    */
    'route' => [
        'prefix' => env('NEPAL_PAYMENT_ROUTE_PREFIX', 'payment'),
        'middleware' => ['web'],
    ],

];
