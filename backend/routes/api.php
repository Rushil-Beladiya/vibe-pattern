<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SuperAdmin\ScreenController as SuperAdminScreenController;
use App\Http\Controllers\SuperAdmin\FormController as SuperAdminFormController;
use App\Http\Controllers\Admin\ScreenController as AdminScreenController;
use App\Http\Controllers\Admin\FormController as AdminFormController;
use App\Http\Controllers\User\ScreenController as UserScreenController;
use App\Http\Controllers\User\FormController as UserFormController;
use Illuminate\Support\Facades\Route;

// ========================================
// AUTH ROUTES (PUBLIC)
// ========================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ========================================
// SUPER ADMIN ROUTES
// ========================================
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('admin')->group(function () {
    
    // Screen Management
    Route::apiResource('screens', SuperAdminScreenController::class);
    
    // Form Management
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

// ========================================
// ADMIN ROUTES (FORM FILLING)
// ========================================
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    
    // Get all active screens
    Route::get('/screens', [AdminScreenController::class, 'index']);
    
    // Get forms for a screen
    Route::get('/screens/{screen}/forms', [AdminScreenController::class, 'forms']);
    
    // Get form detail and submit
    Route::get('/forms/{form}', [AdminFormController::class, 'show']);
    Route::post('/forms/{form}/submit', [AdminFormController::class, 'submit']);
});

// ========================================
// USER ROUTES (VIEW DATA)
// ========================================
Route::middleware(['auth:sanctum', 'role:user'])->prefix('user')->group(function () {
    
    // Get all active screens (for bottom tab bar)
    Route::get('/screens', [UserScreenController::class, 'index']);
    
    // Get forms for a specific screen by slug
    Route::get('/screens/{slug}/forms', [UserScreenController::class, 'formsBySlug']);
    
    // Get form detail
    Route::get('/forms/{form}', [UserFormController::class, 'show']);
});
