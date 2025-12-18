<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Models\Form;
use Illuminate\Http\Request;

final class FormController
{
    /**
     * Get form details
     */
    public function show(Form $form)
    {
        if (!$form->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Form is inactive',
            ], 403);
        }

        $form->load('screen:id,name,slug', 'creator:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Form retrieved successfully',
            'data' => $form,
        ]);
    }

    /**
     * Get all forms by screen slug
     */
    public function getFormsByScreen(Request $request, string $screenSlug)
    {
        $forms = Form::whereHas('screen', function ($query) use ($screenSlug) {
            $query->where('slug', $screenSlug);
        })
        ->where('is_active', true)
        ->with('screen:id,name,slug', 'creator:id,name')
        ->orderBy('updated_at', 'desc')
        ->get();

        if ($forms->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No forms found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $forms,
            'count' => $forms->count(),
            'message' => 'Forms retrieved successfully',
        ]);
    }

    /**
     * Get user's submission history for a form
     */
    public function getSubmissionHistory(Request $request, Form $form)
    {
        if (!$form->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Form is inactive',
            ], 403);
        }

        $perPage = (int) $request->input('per_page', 10);

        $submissions = $form->submissions()
            ->where('submitted_by', $request->user()->id)
            ->with('submittedBy:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $submissions->items(),
            'pagination' => [
                'total' => $submissions->total(),
                'count' => $submissions->count(),
                'per_page' => $submissions->perPage(),
                'current_page' => $submissions->currentPage(),
                'total_pages' => $submissions->lastPage(),
                'has_more' => $submissions->hasMorePages(),
            ],
            'form' => $form->only(['id', 'name', 'screen_id']),
            'message' => 'Submission history retrieved successfully',
        ]);
    }
}

