<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Screen;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ScreenController extends Controller
{
    /**
     * Display a listing of screens
     */
    public function index()
    {
        $screens = Screen::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $screens
        ]);
    }

    /**
     * Store a newly created screen
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:screens,slug',
            'icon' => 'nullable|string|max:255',
            'type' => 'required|string|in:bottom,sidedrawer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Auto-generate slug if not provided
        if (!isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $screen = Screen::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Screen created successfully',
            'data' => $screen
        ], 201);
    }

    /**
     * Display the specified screen
     */
    public function show(Screen $screen)
    {
        return response()->json([
            'success' => true,
            'data' => $screen
        ]);
    }

    /**
     * Update the specified screen
     */
    public function update(Request $request, Screen $screen)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:screens,slug,' . $screen->id,
            'icon' => 'nullable|string|max:255',
            'type' => 'sometimes|required|string|in:bottom,sidedrawer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Auto-update slug if name changed
        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $screen->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Screen updated successfully',
            'data' => $screen
        ]);
    }

    /**
     * Remove the specified screen
     */
    public function destroy(Screen $screen)
    {
        $screen->delete();

        return response()->json([
            'success' => true,
            'message' => 'Screen deleted successfully'
        ]);
    }
}
