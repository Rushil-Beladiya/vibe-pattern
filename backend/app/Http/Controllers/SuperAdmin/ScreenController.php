<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Models\Screen;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class ScreenController 
{
    /**
     * Display a listing of screens
     */
    public function index()
    {
        $screens = Screen::query()->orderBy('sort_order')->get();

        return response()->json([
            'message' => 'Screens retrieved successfully.',
            'data' => $screens,
        ], 200  );
    }

    /**
     * Store a newly created screen
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:screens,name',
            'icon' => 'nullable|string|max:255',
            'type' => 'required|string|in:bottom,sidedrawer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|in:true,false',
        ],[
            'name.unique'=> 'The screen name already exists.',
            'sort_order.unique'=> 'The sort order must be unique.',
            'sort_order.exists'=> 'The sort order already exists.',
        ]);

        if (!isset($validated['sort_order'])) {
            // Assign next available sort order
            $maxSortOrder = Screen::max('sort_order');
            $validated['sort_order'] = $maxSortOrder !== null ? $maxSortOrder + 1 : 1;
        }
        // Auto-generate slug if not provided
        if (! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $validated['is_active'] = (bool) $validated['is_active'];

        $screen = Screen::create($validated);

        return response()->json([
            'message' => 'Screen created successfully',
            'data' => $screen,
        ], 201);
    }

    /**
     * Display the specified screen
     */
    public function show(Screen $screen)
    {
        return response()->json([
            'success' => true,
            'data' => $screen,
        ]);
    }

    /**
     * Update the specified screen
     */
    public function update(Request $request, Screen $screen)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'type' => 'sometimes|required|string|in:bottom,sidedrawer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|in:true,false',
        ],[
            'name.unique'=> 'The screen name already exists.',

        ]);

        // Auto-update slug if name changed
        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
                $validated['is_active'] = (bool) $validated['is_active'];


        $screen->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Screen updated successfully',
            'data' => $screen,
        ]);
    }

    /**
     * Remove the specified screen
     */
    public function destroy(Screen $screen)
    {
        $screen->delete();
        return response()->json([
            'message' => 'Screen deleted successfully',
    
        ], 200);
    }
}
