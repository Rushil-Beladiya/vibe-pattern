<?php

use App\Http\Controllers\Api\AppVersionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\FormTemplateController;
use App\Http\Controllers\Api\UserFormController;
use Illuminate\Support\Facades\Route;

Route::name('api.')->group(function () {

    Route::get('app-version', [AppVersionController::class, 'getAppVersionRequirements']);

    Route::middleware('guest')->controller(AuthController::class)->group(function () {
        Route::post('/register', 'register');
        Route::post('/login', 'login');
    });

    Route::middleware('auth:sanctum')->controller(AuthController::class)->group(function () {
        Route::post('/logout', 'logout');
        Route::get('/user', 'user');
    });

    Route::middleware(['auth:sanctum', 'role:1'])->prefix('forms')->group(function () {
        Route::get('/', [FormTemplateController::class, 'index']);
        Route::post('/create-form', [FormTemplateController::class, 'store']);
        Route::get('/by-screen', [FormTemplateController::class, 'getByScreen']);
        Route::get('/{id}', [FormTemplateController::class, 'show']);
        Route::put('/{id}', [FormTemplateController::class, 'update']);
        Route::delete('/{id}', [FormTemplateController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'role:2'])->group(function () {
        Route::post('/submit-form', [FormSubmissionController::class, 'store']);
    });

    Route::middleware(['auth:sanctum'])->prefix('user')->group(function () {
        Route::get('/view-form/{formSubmission}', [UserFormController::class, 'show']);
    });
});
