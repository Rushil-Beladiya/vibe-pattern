<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Screen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Log;
use Str;

final class FormSubmissionController
{
    /**
     * Get all user submissions
     */
    public function index(Request $request)
    {
        Log::info('Fetching user submissions with filters', ['request' => $request->all()]);

        $submissions = FormSubmission::whereHas('form', function ($query) use ($request) {
            $query->where('screen_id', $request->get('screen_id'));
        })->get();

        return response()->json([
            'success' => true,
            'data' => $submissions,
            'message' => 'Submissions retrieved successfully',
        ]);
    }
    /**
     * Submit form with data
     */
    public function store(Request $request, Form $form)
    {
        try {
            if (!$form->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Form is inactive',
                ], 403);
            }

            $fields = $request->input('fields', []);

            if (empty($fields)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No fields provided',
                ], 400);
            }

            $submittedData = [];
            $uploadedFiles = [];

            foreach ($fields as $field) {
                if (!isset($field['label']) || !isset($field['type'])) {
                    continue;
                }

                $key = $field['key'] ?? Str::slug($field['label'], '_');
                $field['key'] = $key;
                $type = $field['type'];
                $required = filter_var($field['required'] ?? false, FILTER_VALIDATE_BOOLEAN);

                // Handle file uploads
                if (in_array($type, ['file', 'image'])) {
                    $field['value'] = $this->handleFileUpload($request, $field, $form);
                    if ($field['value']) {
                        $uploadedFiles[$key] = $field['value'];
                    }
                } else {
                    $field['value'] = $request->input($key) ?? $request->input("fields.{$key}") ?? null;
                }

                // Validate required
                if ($required && empty($field['value'])) {
                    return response()->json([
                        'success' => false,
                        'message' => "Field '{$field['label']}' is required",
                        'errors' => [$key => ["Required field"]],
                    ], 422);
                }

                $submittedData[] = $field;
            }

            // Create submission
            $submission = FormSubmission::create([
                'form_id' => $form->id,
                'submitted_by' => $request->user()->id,
                'submitted_data' => $submittedData,
                'submission_number' => FormSubmission::generateSubmissionNumber(),
            ]);

            $submission->load(['form.screen:id,name,slug', 'submittedBy:id,name,email']);

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully',
                'data' => [
                    'submission' => $submission,
                    'submission_number' => $submission->submission_number,
                    'uploaded_files' => $uploadedFiles,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Submission failed',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get single submission (user's own)
     */
    public function show(FormSubmission $submission, Request $request)
    {
        // if ($submission->submitted_by !== $request->user()->id) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Unauthorized',
        //     ], 403);
        // }

        $submission->load(['form.screen:id,name,slug', 'submittedBy:id,name,email']);

        return response()->json([
            'success' => true,
            'data' => $submission,
            'message' => 'Submission retrieved successfully',
        ]);
    }

    /**
     * Get form-specific submissions
     */
    public function getFormSubmissions(Request $request, Form $form)
    {
        $perPage = (int) $request->input('per_page', 15);

        $submissions = FormSubmission::where('form_id', $form->id)
            ->where('submitted_by', $request->user()->id)
            ->with(['form.screen:id,name,slug', 'submittedBy:id,name,email'])
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
            ],
            'form' => $form->only(['id', 'name', 'screen_id']),
            'message' => 'Submissions retrieved successfully',
        ]);
    }

    /**
     * Get submissions for all forms under a screen (user-specific)
     */
    public function getScreenSubmissions(Request $request, Screen $screen)
    {
        $perPage = (int) $request->input('per_page', 15);

        $formIds = $screen->forms()->pluck('id')->toArray();

        $submissions = FormSubmission::whereIn('form_id', $formIds)
            ->where('submitted_by', $request->user()->id)
            ->with(['form.screen:id,name,slug', 'submittedBy:id,name,email'])
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
            ],
            'screen' => $screen->only(['id', 'name', 'slug']),
            'message' => 'Submissions retrieved successfully',
        ]);
    }

    /**
     * Get user statistics
     */
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        $stats = [
            'total_submissions' => FormSubmission::where('submitted_by', $userId)->count(),
            'total_forms_filled' => FormSubmission::where('submitted_by', $userId)
                ->distinct('form_id')
                ->count('form_id'),
            'submissions_by_date' => FormSubmission::where('submitted_by', $userId)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Statistics retrieved successfully',
        ]);
    }

    /**
     * Handle file upload
     */
    private function handleFileUpload(Request $request, array $field, Form $form): ?string
    {
        $key = $field['key'];
        $type = $field['type'];
        $fileKey = null;

        // Find file in request
        if ($request->hasFile($key)) {
            $fileKey = $key;
        } elseif ($request->hasFile($field['label'])) {
            $fileKey = $field['label'];
        } else {
            foreach ($request->allFiles() as $uploadKey => $file) {
                if (strpos($uploadKey, $key) !== false || strpos($uploadKey, $field['label']) !== false) {
                    $fileKey = $uploadKey;
                    break;
                }
            }
        }

        if (!$fileKey || !$request->hasFile($fileKey)) {
            return null;
        }

        $file = $request->file($fileKey);

        // Validate image
        if ($type === 'image') {
            $request->validate([
                $fileKey => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);
        }

        // Validate file MIME types
        if ($type === 'file' && isset($field['allowed_mimes'])) {
            $mimes = implode(',', array_map(
                fn($mime) => explode('/', $mime)[1] ?? 'bin',
                $field['allowed_mimes']
            ));

            $request->validate([
                $fileKey => "mimes:$mimes|max:10240",
            ]);
        }

        // Store file
        $storagePath = $form->screen->getSlug() ?? 'forms';
        $path = $file->store($storagePath, 'public');

        return url(Storage::url($path));
    }
}

