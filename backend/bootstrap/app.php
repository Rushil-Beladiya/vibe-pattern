<?php

declare(strict_types=1);

use App\Http\Middleware\CheckRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle foreach() errors with proper error message
        $exceptions->render(function (\TypeError $e) {
            if (str_contains($e->getMessage(), 'foreach()')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Data format error',
                    'message' => 'Invalid data format. The submitted data must be an array or object.',
                    'debug' => config('app.debug') ? $e->getMessage() : null,
                ], 400);
            }
        });
    })->create();
