<?php

namespace App\Http\Controllers\Api;

use App\Enums\ScreenType;
use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class FormTemplateController extends Controller
{
    private const ALLOWED_TYPES = ['text', 'number', 'textarea', 'email', 'checkbox', 'select', 'image', 'file'];

    // Get all form templates (for admin dashboard)
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $templates = FormTemplate::withCount('submissions')
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Form templates fetched successfully.',
                'data' => $templates,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to fetch form templates', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch form templates.',
            ], 500);
        }
    }

    // Get templates by screen
    public function getByScreen(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'screen' => ['required', Rule::in(ScreenType::values())],
            ]);

            $user = $request->user();

            $templates = FormTemplate::where('screen', $validated['screen'])
                ->withCount('submissions')
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Templates fetched successfully.',
                'data' => $templates,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Failed to get forms by screen', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to get forms.',
            ], 500);
        }
    }

    // Create new form template
    public function store(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'screen' => ['required', 'string', Rule::in(ScreenType::values())],
                'name' => ['required', 'string', 'max:255'],
                'fields' => ['required', 'array', 'min:1'],
                'fields.*.key' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9_]+$/'],
                'fields.*.type' => ['required', Rule::in(self::ALLOWED_TYPES)],
                'fields.*.options' => ['nullable', 'array', 'min:1', 'required_if:type,select'],
                'fields.*.options.*' => ['string'],
            ]);

            $keys = array_column($validated['fields'], 'key');
            if (count($keys) !== count(array_unique($keys))) {
                return response()->json([
                    'message' => 'Duplicate field keys found. Each field must have a unique key.',
                ], 422);
            }

            foreach ($validated['fields'] as $field) {
                if ($field['type'] === 'select' && empty($field['options'])) {
                    return response()->json([
                        'message' => 'Select fields must contain at least one option.',
                    ], 422);
                }
            }

            $existingForm = FormTemplate::where('name', $validated['name'])
                ->where('screen', $validated['screen'])
                ->first();

            if ($existingForm) {
                return response()->json([
                    'message' => 'A form with this name already exists for the selected screen.',
                ], 422);
            }

            $template = DB::transaction(function () use ($validated) {
                // Process fields: generate label from key slug
                $fields = collect($validated['fields'])->map(function (array $field) {
                    return [
                        'key' => $field['key'],
                        'type' => $field['type'],
                        'label' => Str::headline($field['key']), // Generate label from key
                        'options' => $field['options'] ?? [],
                    ];
                })->values()->all();

                return FormTemplate::create([
                    'screen' => $validated['screen'],
                    'name' => $validated['name'],
                    'fields' => $fields,
                ]);
            });

            return response()->json([
                'message' => 'Form template created successfully.',
                'data' => $template,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Failed to create form template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create form template.',
            ], 500);
        }
    }

    // Get single form template
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();

            $template = FormTemplate::withCount('submissions')->findOrFail($id);

            return response()->json([
                'message' => 'Form template fetched successfully.',
                'data' => $template,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to fetch form template', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch form template.',
            ], 500);
        }
    }

    // Update form template
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();

            $template = FormTemplate::findOrFail($id);

            $validated = $request->validate([
                'screen' => ['sometimes', 'string', Rule::in(ScreenType::values())],
                'name' => ['sometimes', 'string', 'max:255'],
                'fields' => ['sometimes', 'array', 'min:1'],
                'fields.*.key' => ['sometimes', 'string', 'max:255', 'regex:/^[a-z0-9_]+$/'],
                'fields.*.type' => ['sometimes', Rule::in(self::ALLOWED_TYPES)],
                'fields.*.options' => ['nullable', 'array', 'min:1'],
                'fields.*.options.*' => ['string'],
            ], [
                'fields.*.key.regex' => 'Field key must contain only lowercase letters, numbers, and underscores',
            ]);

            if (isset($validated['name']) && isset($validated['screen'])) {
                // Check if another form with same name and screen already exists
                $existingForm = FormTemplate::where('name', $validated['name'])
                    ->where('screen', $validated['screen'])
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingForm) {
                    return response()->json([
                        'message' => 'A form with this name already exists for the selected screen.',
                    ], 422);
                }
            }

            if (isset($validated['fields'])) {
                // Check for duplicate keys within the same form
                $keys = array_column($validated['fields'], 'key');
                if (count($keys) !== count(array_unique($keys))) {
                    return response()->json([
                        'message' => 'Duplicate field keys found. Each field must have a unique key.',
                    ], 422);
                }

                // Validate select fields have options
                foreach ($validated['fields'] as $field) {
                    if ($field['type'] === 'select' && empty($field['options'])) {
                        return response()->json([
                            'message' => 'Select fields must contain at least one option.',
                        ], 422);
                    }
                }

                // Process fields: generate label from key slug
                $validated['fields'] = collect($validated['fields'])->map(function (array $field) {
                    return [
                        'key' => $field['key'],
                        'type' => $field['type'],
                        'label' => Str::headline($field['key']), // Generate label from key
                        'options' => $field['options'] ?? [],
                    ];
                })->values()->all();
            }

            $template->update($validated);

            return response()->json([
                'message' => 'Form template updated successfully.',
                'data' => $template->fresh(),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Failed to update form template', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update form template.',
            ], 500);
        }
    }

    // Delete form template
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();

            $template = FormTemplate::findOrFail($id);

            // Check if form has submissions
            if ($template->submissions()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete form template that has existing submissions.',
                ], 422);
            }

            $template->delete();

            return response()->json([
                'message' => 'Form template deleted successfully.',
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to delete form template', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete form template.',
            ], 500);
        }
    }
}
