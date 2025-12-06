<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

final class AppVersionController  
{
    /**
     * Get the current app version requirements.
     * This endpoint provides the minimum required version for Android and iOS apps.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAppVersionRequirements()
    {
        return response()->json([
            'message' => 'App version requirements retrieved successfully.',
            'data' => [
                'min_android_version' => config('app_version.min_android_version'),
                'min_ios_version' => config('app_version.min_ios_version'),
                'last_updated' => now()->toDateTimeString(),
            ],
        ]);
    }
}
