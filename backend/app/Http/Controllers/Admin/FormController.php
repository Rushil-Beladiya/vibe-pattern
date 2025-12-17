<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Str;

final class FormController 
{
    /**
     * Display the specified form
     */
    public function show(Form $form)
    {
        $form->load('screen');

        return response()->json([
            'message' => 'Form retrieved successfully',
            'data' => $form,
        ]);
    }

    /**
     * Submit form data (fill in field values)
     * Handles both JSON and multipart FormData requests
     * Creates a new submission record each time
     */
    public function store(Request $request, Form $form)
    {
        try {

            // Handle both JSON and FormData payloads
            $fields = $request->input('fields', []);
            
    
            if (empty($fields)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No fields provided',
                ], 400);
            }
    
            $submittedData = [];
            $uploadedFiles = [];
            // $fields = json_decode($fields);
            Log::info('Submitting form data.',[
                'fields' => $fields,
            ]);
            foreach ($fields as $field) {
                // Ensure field has required properties
                if (!isset($field['label']) || !isset($field['type'])) {
                    continue;
                }
    
                $key = $field['key'] ?? Str::slug($field['label'], '_');
                $field['key'] = $key;
                $type = $field['type'];
                $required = filter_var($field['required'] ?? false, FILTER_VALIDATE_BOOLEAN);
    
                // Handle file uploads
                if (\in_array($type, ['file', 'image'])) {
                    // Check for file in request - use field key or label-based key
                    $fileKey = null;
                    if ($request->hasFile($key)) {
                        $fileKey = $key;
                    } elseif ($request->hasFile($field['label'])) {
                        $fileKey = $field['label'];
                    } else {
                        // Try to find any file for this field
                        foreach ($request->allFiles() as $uploadKey => $file) {
                            if (strpos($uploadKey, $key) !== false || strpos($uploadKey, $field['label']) !== false) {
                                $fileKey = $uploadKey;
                                break;
                            }
                        }
                    }
    
                    if ($fileKey && $request->hasFile($fileKey)) {
                        $file = $request->file($fileKey);
    
                        // Validate file type for images
                        if ($type === 'image') {
                            $request->validate([
                                $fileKey => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                            ]);
                        }
    
                        // Validate allowed mimes for files
                        if ($type === 'file' && isset($field['allowed_mimes'])) {
                            $mimes = implode(',', array_map(fn($mime) => explode('/', $mime)[1] ?? 'bin', $field['allowed_mimes']));
    
                            $validated = $request->validate([
                                "$fileKey" => "mimes:$mimes|max:10240",
                            ]);
                        }
    
                        // Store file in public storage
                        $path = $file->store($form->screen->getSlug(), 'public'); // Assuming getSlug() is a method that retrieves the slug
                        $url = Storage::url($path);
                        $field['value'] = url($url);
                        $uploadedFiles[$key] = url($url);
                    } else {
                        // No file uploaded, keep existing value or null
                        $field['value'] ??= null;
                    }
                } else {
                    // Get value from request for non-file fields
                    $field['value'] = $request->input($key) ?? $request->input("fields.{$key}") ?? $field['value'] ?? null;
                }
    
                // Validate required fields
                if ($required && ($field['value'] === null || $field['value'] === '')) {
                    return response()->json([
                        'success' => false,
                        'message' => "Field '{$field['label']}' is required",
                        'errors' => [
                            $key => ["The {$field['label']} field is required"],
                        ],
                    ], 422);
                }
    
                $submittedData[] = $field;
            }
    
            // Create a new form submission record
            $submission = FormSubmission::create([
                'form_id' => $form->id,
                'submitted_by' => $request->user()->id,
                'submitted_data' => $submittedData,
                'submission_number' => FormSubmission::generateSubmissionNumber(),
            ]);
    
            // Load relationships
            $submission->load(['form.screen', 'submittedBy']);
    
            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully',
                'data' => [
                    'submission' => $submission,
                    'submission_number' => $submission->submission_number,
                    'uploaded_files' => $uploadedFiles,
                    'total_submissions' => FormSubmission::where('form_id', $form->id)
                        ->where('submitted_by', $request->user()->id)
                        ->count(),
                ],
            ], 201);
        }catch(\Exception $e){
            Log::error('Error submitting form.',[
                'form_id' => $form->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting the form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all submissions for a specific form by the authenticated admin
     */
    public function submissions(Request $request, Form $form)
    {
        $perPage = $request->input('per_page', 15);
        
        $submissions = FormSubmission::where('form_id', $form->id)
            ->where('submitted_by', $request->user()->id)
            ->with(['form.screen', 'submittedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $submissions,
            'meta' => [
                'total_submissions' => $submissions->total(),
                'submissions_count' => $submissions->count(),
            ],
            'message' => 'Submissions retrieved successfully',
        ]);
    }

    /**
     * Get a specific submission detail
     */
    public function getSubmission(FormSubmission $submission)
    {
        $submission->load(['form.screen', 'submittedBy']);

        return response()->json([
            'data' => $submission,
            'message' => 'Submission retrieved successfully',
        ], 200);
    }

    /**
     * Parse FormData array format: fields[0][label], fields[0][value], etc.
     * Converts to array of field objects
     */
    private function parseFormDataArray(Request $request): array
    {
        $fields = [];
        $allInput = $request->all();
        
        // Group by index: fields[0][...], fields[1][...], etc.
        $fieldsByIndex = [];
        
        foreach ($allInput as $key => $value) {
            if (preg_match('/^fields\[(\d+)\]\[(.+)\]$/', $key, $matches)) {
                $index = (int) $matches[1];
                $prop = $matches[2];
                
                if (!isset($fieldsByIndex[$index])) {
                    $fieldsByIndex[$index] = [];
                }
                $fieldsByIndex[$index][$prop] = $value;
            }
        }
        
        // Convert to indexed array
        ksort($fieldsByIndex);
        return array_values($fieldsByIndex);
    }
}
