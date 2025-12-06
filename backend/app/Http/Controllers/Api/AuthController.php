<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\RoleType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

final class AuthController

{
    public function getAppVersion()
    {
        return response()->json([
            'message' => 'App version requirements retrieved successfully.',
            'data' => [
                'min_android_version' => config('app_version.min_android_version'),
                'min_ios_version' => config('app_version.min_ios_version'),
                'last_updated' => now()->toDateTimeString(),
            ]
        ] , 200);
    }
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'token_name' => ['sometimes', 'string', 'max:255'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
                'data' => [],
            ], 401);
        }

        $token = $user->createToken($validated['token_name'] ?? 'auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data' => ['user' => $user, 'token' => $token],
        ], 200);
    }
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if (User::query()->where('email', $validated['email'])->exists()) {
            return response()->json([
                'message' => 'The email address is already in use.',
                'data' => [],
            ], 400);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => RoleType::User->value,
        ]);

        $token = $user->createToken($request->input('token_name', 'auth_token'))->plainTextToken;

        return response()->json([
            'mssage' => 'Registration successful.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 200);

    }
    public function logout(Request $request): JsonResponse
    {
        /** @var PersonalAccessToken|null $currentAccessToken */
        $currentAccessToken = $request->user()?->currentAccessToken();

        $currentAccessToken?->delete();

        return response()->json([
            'message' => 'Logout successful.',
            'data' => [],
        ], 200);
    } 
}
