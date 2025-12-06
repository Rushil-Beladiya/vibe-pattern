<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\Screen;
use Illuminate\Http\Request;

class FormController extends Controller
{
    /**
     * Display all forms for super admin dashboard
     */
    public function getAllForms()
    {
        $forms = Form::with('screen:id,name', 'creator:id,name')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $forms
        ]);
    }

    /**
     * Display forms for a specific screen
     */
    public function index(Screen $screen)
    {
        $forms = $screen->forms()->with('creator:id,name')->get();

        return response()->json([
            'success' => true,
            'data' => $forms
        ]);
    }

    /**
     * Store a newly created form for a screen
     */
    public function store(Request $request, Screen $screen)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'fields' => 'required|array',
            'fields.*.label' => 'required|string',
            'fields.*.key' => 'required|string',
            'fields.*.type' => 'required|string|in:text,input,select,image,file,textarea,date,checkbox',
            'fields.*.value' => 'nullable',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.required' => 'nullable|boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.allowed_mimes' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        // Initialize empty values for all fields
        foreach ($validated['fields'] as &$field) {
            if (!isset($field['value'])) {
                $field['value'] = '';
            }
        }

        $form = $screen->forms()->create([
            'name' => $validated['name'],
            'fields' => $validated['fields'],
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Form created successfully',
            'data' => $form->load('screen', 'creator:id,name')
        ], 201);
    }

    /**
     * Display the specified form
     */
    public function show(Form $form)
    {
        $form->load('screen', 'creator:id,name');

        return response()->json([
            'success' => true,
            'data' => $form
        ]);
    }

    /**
     * Update the specified form
     */
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'fields' => 'sometimes|required|array',
            'fields.*.label' => 'required|string',
            'fields.*.key' => 'required|string',
            'fields.*.type' => 'required|string|in:text,input,select,image,file,textarea,date,checkbox',
            'fields.*.value' => 'nullable',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.required' => 'nullable|boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.allowed_mimes' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $form->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Form updated successfully',
            'data' => $form->load('screen', 'creator:id,name')
        ]);
    }

    /**
     * Remove the specified form
     */
    public function destroy(Form $form)
    {
        $form->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form deleted successfully'
        ]);
    }
}
