<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Screen;

final class ScreenController 
{
    /**
     * Display all active screens for admin
     */
    public function index()
    {
        $screens = Screen::active()->ordered()->get();

        return response()->json([
            'message' => 'Screens retrieved successfully',
            'data' => $screens,
        ], 200);
    }

    /**
     * Get forms for a specific screen
     */
    public function forms(Screen $screen)
    {
        $forms = $screen->activeForms()->get();

        return response()->json([
            'message' => 'Forms retrieved successfully',
            'data' => $forms,
        ], 200);
    }
}
