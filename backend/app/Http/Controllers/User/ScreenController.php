<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Screen;
use Illuminate\Http\Request;

class ScreenController extends Controller
{
    /**
     * Display all active screens for user (for bottom tab bar)
     */
    public function index()
    {
        $screens = Screen::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $screens
        ]);
    }

    /**
     * Get forms for a specific screen by slug
     */
    public function formsBySlug($slug)
    {
        $screen = Screen::where('slug', $slug)->where('is_active', true)->first();

        if (!$screen) {
            return response()->json([
                'success' => false,
                'message' => 'Screen not found'
            ], 404);
        }

        $forms = $screen->activeForms()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'screen' => $screen,
                'forms' => $forms
            ]
        ]);
    }
}
