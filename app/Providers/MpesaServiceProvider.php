<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class MpesaServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton('mpesa', function ($app) {
            return new MpesaService();
        });
    }

    public function boot()
    {
        //
    }
}