<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\FormController as AdminFormController;
use App\Http\Controllers\Admin\ScreenController as AdminScreenController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\SuperAdmin\FormController as SuperAdminFormController;
use App\Http\Controllers\SuperAdmin\ScreenController as SuperAdminScreenController;
use App\Http\Controllers\User\FormController as UserFormController;
use App\Http\Controllers\User\ScreenController as UserScreenController;
use Illuminate\Support\Facades\Route;

Route::name('api.')->group(function () {

    Route::get('app-version', [AuthController::class, 'getAppVersion']);

    Route::middleware('guest')->controller(AuthController::class)->group(function () {
        Route::post('/register', 'register');
        Route::post('/login', 'login');
    });

    Route::middleware('auth:sanctum')->controller(AuthController::class)->group(function () {
        Route::post('/logout', 'logout');
        Route::get('/user', 'user');
    });

    Route::middleware(['auth:sanctum'])->prefix('super-admin')->group(function () {

        Route::apiResource('screens', SuperAdminScreenController::class );
        
        Route::apiResource('forms', SuperAdminFormController::class );

        Route::prefix('screens/{screen}')->group(function () {
            Route::get('/forms', [SuperAdminFormController::class, 'index']);
            Route::post('/forms', [SuperAdminFormController::class, 'store']);
        });

        Route::prefix('forms')->group(function () {
            Route::get('/{form}', [SuperAdminFormController::class, 'show']);
            Route::put('/{form}', [SuperAdminFormController::class, 'update']);
            Route::delete('/{form}', [SuperAdminFormController::class, 'destroy']);
        });
    });

    Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

        Route::get('/screens', [AdminScreenController::class, 'index']);

        // Get a single screen detail
        Route::get('/screens/{screen}', [AdminScreenController::class, 'show']);

        // Get forms for a screen
        Route::get('/screens/{screen}/forms', [AdminScreenController::class, 'forms']);

        // Get form detail and submit
        Route::get('/forms/{form}', [AdminFormController::class, 'show']);
        Route::post('/forms/{form}/submit', [AdminFormController::class, 'store']);
        
        // Get all submissions for a form by the authenticated admin
        Route::get('/forms/{form}/submissions', [AdminFormController::class, 'submissions']);
        
        // Get a specific submission detail
        Route::get('/submissions/{submission}', [AdminFormController::class, 'getSubmission']);
    });

    Route::middleware(['auth:sanctum'])->prefix('user')->group(function () {

        // Get all active screens (for bottom tab bar)
        Route::get('/screens', [UserScreenController::class, 'index']);

        // Get forms for a specific screen by slug
        Route::get('/screens/{slug}/forms', [UserScreenController::class, 'formsBySlug']);

        // Get form detail
        Route::get('/forms/{form}', [UserFormController::class, 'show']);
        
        // Get all submissions for a specific form (paginated)
        Route::get('/forms/{form}/submissions', [UserFormController::class, 'index']);
        
        // Get submission statistics
        Route::get('/forms/{form}/statistics', [UserFormController::class, 'statistics']);
        
        // Get specific submission detail
        Route::get('/submissions/{submission}', [UserFormController::class, 'show']);
    });
});
