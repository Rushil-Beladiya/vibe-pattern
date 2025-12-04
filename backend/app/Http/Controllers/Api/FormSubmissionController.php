<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSubmission;
use App\Models\FormTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FormSubmissionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_template_id' => ['required', 'exists:form_templates,id'],
        ]);

        /** @var FormTemplate $template */
        $template = FormTemplate::findOrFail($validated['form_template_id']);

        $rules = [];
        foreach ($template->fields as $field) {
            $key = 'submitted_data.' . $field['key'];
            $rules[$key] = match ($field['type']) {
                'text', 'textarea' => ['required', 'string'],
                'checkbox' => ['required', 'boolean'],
                'select' => ['required', 'string', 'in:' . implode(',', $field['options'] ?? [])],
                'image' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
                'file' => ['required', 'file', 'mimes:mp3', 'max:10240'],
                default => ['nullable'],
            };
        }

        $validated = array_merge(
            $validated,
            $request->validate($rules)
        );

        $payload = [];

        foreach ($template->fields as $field) {
            $key = $field['key'];
            $type = $field['type'];
            $value = data_get($request, "submitted_data.$key");

            if (in_array($type, ['image', 'file'], true) && $request->file("submitted_data.$key")) {
                $directory = $type === 'image' ? 'form-images' : 'form-audio';
                $path = $request->file("submitted_data.$key")->store("forms/$directory", 'public');
                /** @var \Illuminate\Filesystem\FilesystemAdapter $publicDisk */
                $publicDisk = Storage::disk('public');
                $payload[$key] = $publicDisk->url($path);
                continue;
            }

            if ($type === 'checkbox') {
                $payload[$key] = (bool) $value;
                continue;
            }

            $payload[$key] = $value;
        }

        $submission = FormSubmission::create([
            'form_template_id' => $template->id,
            'submitted_by' => $request->user()->id,
            'submitted_data' => $payload,
        ]);

        return response()->json([
            'responseCode' => 201,
            'responseText' => 'Form submitted successfully.',
            'responseData' => [
                'screen_name' => $template->screen_name,
                'submitted_data' => $payload,
                'submission_id' => $submission->id,
            ],
        ], 201);
    }
}

