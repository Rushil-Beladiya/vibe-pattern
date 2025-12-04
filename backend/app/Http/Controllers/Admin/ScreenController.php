<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Screen;
use Illuminate\Http\Request;

class ScreenController extends Controller
{
    /**
     * Display all active screens for admin
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
     * Get forms for a specific screen
     */
    public function forms(Screen $screen)
    {
        $forms = $screen->activeForms()->get();

        return response()->json([
            'success' => true,
            'data' => $forms
        ]);
    }
}
