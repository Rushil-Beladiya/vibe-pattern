<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Form;
use Illuminate\Http\Request;
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
            'success' => true,
            'data' => $form,
        ]);
    }

    /**
     * Submit form data (fill in field values)
     * Handles both JSON and multipart FormData requests
     */
    public function store(Request $request, Form $form)
    {
        // Handle both JSON and FormData payloads
        $fields = $request->input('fields', []);
        
        // If fields is empty, try to parse FormData array format (fields[0][label], fields[0][value], etc)
        if (empty($fields) && $request->all()) {
            $fields = $this->parseFormDataArray($request);
        }

        if (empty($fields)) {
            return response()->json([
                'success' => false,
                'message' => 'No fields provided',
            ], 400);
        }

        $updatedFields = [];
        $uploadedFiles = [];
        
        foreach ($fields as $field) {
            // Ensure field has required properties
            if (!isset($field['label']) || !isset($field['type'])) {
                continue;
            }

            $key = $field['key'] ?? \Str::slug($field['label'], '_');
            $field['key'] = $key;
            $type = $field['type'];
            $required = filter_var($field['required'] ?? false, FILTER_VALIDATE_BOOLEAN);

            // Handle file uploads
            if (in_array($type, ['file', 'image'])) {
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
                        $validated = $request->validate([
                            $fileKey => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                        ]);
                    }

                    // Validate allowed mimes for files
                    if ($type === 'file' && isset($field['allowed_mimes'])) {
                        $mimes = implode(',', array_map(function ($mime) {
                            return explode('/', $mime)[1] ?? 'bin';
                        }, $field['allowed_mimes']));

                        $validated = $request->validate([
                            $fileKey => 'mimes:' . $mimes . '|max:10240',
                        ]);
                    }

                    // Store file in public storage
                    $path = $file->store( $form->screen->slug, 'public');
                    $url = Storage::url($path);
                    $field['value'] = url($url);
                    $uploadedFiles[$key] = url($url);
                } else {
                    // No file uploaded, keep existing value or null
                    $field['value'] = $field['value'] ?? null;
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

            $updatedFields[] = $field;
        }

        // Update form with new field values
        $form->fields = $updatedFields;
        $form->save();

        return response()->json([
            'success' => true,
            'message' => 'Form submitted successfully',
            'data' => [
                'form' => $form,
                'uploaded_files' => $uploadedFiles,
            ],
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
