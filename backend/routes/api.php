<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\FormController as AdminFormController;
use App\Http\Controllers\Admin\FormSubmissionController as AdminFormSubmissionController;
use App\Http\Controllers\Admin\ScreenController as AdminScreenController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\SuperAdmin\FormController as SuperAdminFormController;
use App\Http\Controllers\SuperAdmin\ScreenController as SuperAdminScreenController;
use App\Http\Controllers\User\FormController as UserFormController;
use App\Http\Controllers\User\FormSubmissionController as UserFormSubmissionController;
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

        Route::get('/screens/{screen}', [AdminScreenController::class, 'show']);

        Route::get('/screens/{screen}/forms', [AdminScreenController::class, 'forms']);

        Route::prefix('forms')->group(function () {
            Route::get('/{form}', [AdminFormController::class, 'show']);
            
            Route::post('/{form}/submit', [AdminFormController::class, 'store']);
        });

        Route::prefix('submissions')->group(function () {
            Route::get('/form/{form}', [AdminFormSubmissionController::class, 'index']);
            
            Route::get('/{submission}', [AdminFormSubmissionController::class, 'show']);
            
            Route::get('/form/{form}/user/{userId}', [AdminFormSubmissionController::class, 'getSubmissionsByUser']);
            
            Route::get('/form/{form}/export', [AdminFormSubmissionController::class, 'export']);
            
            Route::get('/form/{form}/statistics', [AdminFormSubmissionController::class, 'getStatistics']);
        });

        Route::get('/forms/{form}/submissions', [AdminFormController::class, 'submissions']);
        Route::get('/submissions/{submission}', [AdminFormController::class, 'getSubmission']);
    });

    Route::middleware(['auth:sanctum'])->prefix('user')->group(function () {

        Route::get('/screens', [UserScreenController::class, 'index']);

        Route::get('/screens/{slug}/forms', [UserScreenController::class, 'formsBySlug']);

        Route::prefix('forms')->group(function () {
            Route::get('/{form}', [UserFormController::class, 'show']);
            
            Route::post('/{form}/submit', [UserFormSubmissionController::class, 'store']);
            
            Route::get('/{form}/submissions', [UserFormController::class, 'getSubmissionHistory']);
            
            Route::get('/by-screen/{screenSlug}', [UserFormController::class, 'getFormsByScreen']);
        });

        Route::prefix('submissions')->group(function () {
            Route::get('/', [UserFormSubmissionController::class, 'index']);
            
            Route::get('/{submission}', [UserFormSubmissionController::class, 'show']);
            
            Route::get('/form/{form}', [UserFormSubmissionController::class, 'getFormSubmissions']);

            // Get submissions by screen (user-specific)
            Route::get('/screen/{screen}', [UserFormSubmissionController::class, 'getScreenSubmissions']);
            
            Route::get('/stats/overview', [UserFormSubmissionController::class, 'getStats']);
        });
    });
});
