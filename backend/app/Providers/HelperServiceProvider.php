<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class HelperServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        foreach (glob(app_path('Helpers') . '/*.php') as $file) {
            require_once $file;
        }
    }
}