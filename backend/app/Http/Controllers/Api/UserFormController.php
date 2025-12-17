<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class UserFormController  
{
    /**
     * Get all submissions for a specific form
     * Shows all submissions created by all admins
     */
    public function index(Request $request, Form $form): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $submissions = FormSubmission::where('form_id', $form->id)
            ->with(['form.screen', 'submittedBy:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Count submissions per field if needed
        $fieldCounts = [];
        if ($submissions->isNotEmpty()) {
            $allSubmissions = FormSubmission::where('form_id', $form->id)->get();
            
            // Get all unique field keys
            $fieldKeys = [];
            foreach ($allSubmissions as $sub) {
                $submittedData = $sub->getSubmittedDataAsArray();
                foreach ($submittedData as $field) {
                    if (isset($field['key'])) {
                        $fieldKeys[$field['key']] = $field['label'] ?? $field['key'];
                    }
                }
            }
            
            // Count non-empty values for each field
            foreach ($fieldKeys as $key => $label) {
                $count = 0;
                foreach ($allSubmissions as $sub) {
                    $submittedData = $sub->getSubmittedDataAsArray();
                    foreach ($submittedData as $field) {
                        if (isset($field['key']) && $field['key'] === $key && !empty($field['value'])) {
                            $count++;
                            break;
                        }
                    }
                }
                $fieldCounts[$key] = [
                    'label' => $label,
                    'count' => $count,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $submissions,
            'meta' => [
                'total_submissions' => $submissions->total(),
                'current_page_count' => $submissions->count(),
                'field_statistics' => $fieldCounts,
                'form_info' => [
                    'id' => $form->id,
                    'name' => $form->name,
                    'screen' => $form->screen->name ?? null,
                ],
            ],
        ]);
    }

    /**
     * Get a specific form submission detail
     */
    public function show(FormSubmission $submission): JsonResponse
    {
        $submission->load(['form.screen', 'submittedBy:id,name,email']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $submission->id,
                'submission_number' => $submission->submission_number,
                'form_name' => $submission->form->name,
                'screen_name' => $submission->form->screen->name ?? null,
                'submitted_by' => [
                    'id' => $submission->submittedBy->id,
                    'name' => $submission->submittedBy->name,
                    'email' => $submission->submittedBy->email,
                ],
                'submitted_data' => $submission->submitted_data,
                'submitted_at' => $submission->created_at,
                'updated_at' => $submission->updated_at,
            ],
        ]);
    }

    /**
     * Get submission statistics for a form
     */
    public function statistics(Form $form): JsonResponse
    {
        $totalSubmissions = FormSubmission::where('form_id', $form->id)->count();
        
        // Get submissions grouped by submitted_by
        $submissionsByUser = FormSubmission::where('form_id', $form->id)
            ->selectRaw('submitted_by, COUNT(*) as submission_count')
            ->groupBy('submitted_by')
            ->with('submittedBy:id,name,email')
            ->get();

        // Get all submissions to analyze field data
        $allSubmissions = FormSubmission::where('form_id', $form->id)->get();
        
        $fieldStatistics = [];
        
        if ($allSubmissions->isNotEmpty()) {
            // Analyze each field across all submissions
            $fieldData = [];
            
            foreach ($allSubmissions as $submission) {
                $submittedData = $submission->getSubmittedDataAsArray();
                foreach ($submittedData as $field) {
                    $key = $field['key'] ?? null;
                    if (!$key) continue;
                    
                    if (!isset($fieldData[$key])) {
                        $fieldData[$key] = [
                            'label' => $field['label'] ?? $key,
                            'type' => $field['type'] ?? 'text',
                            'filled_count' => 0,
                            'empty_count' => 0,
                            'values' => [],
                        ];
                    }
                    
                    if (!empty($field['value'])) {
                        $fieldData[$key]['filled_count']++;
                        $fieldData[$key]['values'][] = $field['value'];
                    } else {
                        $fieldData[$key]['empty_count']++;
                    }
                }
            }
            
            // Format statistics
            foreach ($fieldData as $key => $data) {
                $fieldStatistics[] = [
                    'field_key' => $key,
                    'field_label' => $data['label'],
                    'field_type' => $data['type'],
                    'filled_count' => $data['filled_count'],
                    'empty_count' => $data['empty_count'],
                    'fill_rate' => $totalSubmissions > 0 
                        ? round(($data['filled_count'] / $totalSubmissions) * 100, 2) 
                        : 0,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'form_id' => $form->id,
                'form_name' => $form->name,
                'total_submissions' => $totalSubmissions,
                'submissions_by_user' => $submissionsByUser->map(function ($item) {
                    return [
                        'user_id' => $item->submitted_by,
                        'user_name' => $item->submittedBy->name ?? 'Unknown',
                        'user_email' => $item->submittedBy->email ?? null,
                        'submission_count' => $item->submission_count,
                    ];
                }),
                'field_statistics' => $fieldStatistics,
            ],
        ]);
    }
}
