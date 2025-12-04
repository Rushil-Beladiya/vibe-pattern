<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FormController extends Controller
{
    /**
     * Display the specified form
     */
    public function show(Form $form)
    {
        $form->load('screen');

        return response()->json([
            'success' => true,
            'data' => $form
        ]);
    }

    /**
     * Submit form data (fill in field values)
     */
    public function submit(Request $request, Form $form)
    {
        $fields = $form->fields;
        $updatedFields = [];
        $uploadedFiles = [];

        foreach ($fields as $field) {
            $key = $field['key'];
            $type = $field['type'];
            $required = $field['required'] ?? false;

            // Validate required fields
            if ($required) {
                if (in_array($type, ['file', 'image'])) {
                    $request->validate([
                        $key => 'required|file'
                    ]);
                } else {
                    $request->validate([
                        $key => 'required'
                    ]);
                }
            }

            // Handle file uploads
            if (in_array($type, ['file', 'image']) && $request->hasFile($key)) {
                $file = $request->file($key);
                
                // Validate file type for images
                if ($type === 'image') {
                    $request->validate([
                        $key => 'image|mimes:jpeg,png,jpg,gif|max:5120' // 5MB max
                    ]);
                }

                // Validate allowed mimes for files
                if ($type === 'file' && isset($field['allowed_mimes'])) {
                    $mimes = implode(',', array_map(function($mime) {
                        return explode('/', $mime)[1];
                    }, $field['allowed_mimes']));
                    
                    $request->validate([
                        $key => 'mimes:' . $mimes . '|max:10240' // 10MB max
                    ]);
                }

                // Store file
                $path = $file->store('uploads/' . $form->screen->slug, 'public');
                $url = Storage::url($path);
                $field['value'] = url($url);
                $uploadedFiles[$key] = $url;
            }
            // Handle regular input
            elseif ($request->has($key)) {
                $field['value'] = $request->input($key);
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
                'uploaded_files' => $uploadedFiles
            ]
        ]);
    }
}
