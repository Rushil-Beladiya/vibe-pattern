<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;

final class FormSubmissionController
{
    /**
     * Get all submissions for a form
     */
    public function index(Request $request, Form $form)
    {
        // Authorization check
        if ($form->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $perPage = (int) $request->input('per_page', 15);
        $searchBy = $request->input('search_by');
        $searchValue = $request->input('search_value');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = in_array($request->input('sort_order', 'desc'), ['asc', 'desc']) ? $request->input('sort_order') : 'desc';

        $query = FormSubmission::where('form_id', $form->id)
            ->with(['form:id,name,screen_id', 'submittedBy:id,name,email']);

        // Apply search filter
        if ($searchBy && $searchValue) {
            $query->whereJsonContains("submitted_data->{$searchBy}", $searchValue);
        }

        // Apply secure sort
        $allowedSort = ['created_at', 'submission_number', 'submitted_by', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSort) ? $sortBy : 'created_at';

        $submissions = $query->orderBy($sortBy, $sortOrder)
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
            'statistics' => [
                'total_submissions' => $submissions->total(),
                'unique_submitters' => FormSubmission::where('form_id', $form->id)
                    ->distinct('submitted_by')
                    ->count(),
            ],
            'message' => 'Submissions retrieved successfully',
        ]);
    }

    /**
     * Get single submission
     */
    public function show(Request $request, FormSubmission $submission)
    {
        // Authorization check
        if ($submission->form->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $submission->load(['form:id,name,screen_id', 'submittedBy:id,name,email']);

        return response()->json([
            'success' => true,
            'data' => $submission,
            'message' => 'Submission retrieved successfully',
        ]);
    }

    /**
     * Get submissions by specific user
     */
    public function getSubmissionsByUser(Request $request, Form $form, int $userId)
    {
        // Authorization check
        if ($form->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $perPage = (int) $request->input('per_page', 15);

        $submissions = FormSubmission::where('form_id', $form->id)
            ->where('submitted_by', $userId)
            ->with(['submittedBy:id,name,email'])
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
            'user_id' => $userId,
            'message' => 'User submissions retrieved successfully',
        ]);
    }

    /**
     * Export submissions to CSV
     */
    public function export(Request $request, Form $form)
    {
        // Authorization check
        if ($form->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $submissions = FormSubmission::where('form_id', $form->id)
            ->with('submittedBy:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No submissions to export',
            ], 404);
        }

        $fields = $form->getFieldsAsArray();
        $filename = "submissions_{$form->id}_" . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($submissions, $form, $fields) {
            $handle = fopen('php://output', 'w');

            // Write BOM for UTF-8
            fwrite($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Write headers
            $headers = ['Submission #', 'Submitted By', 'Email', 'Date'];
            foreach ($fields as $field) {
                $headers[] = $field['label'] ?? $field['key'];
            }
            fputcsv($handle, $headers);

            // Write data rows
            foreach ($submissions as $submission) {
                $row = [
                    $submission->submission_number,
                    $submission->submittedBy->name,
                    $submission->submittedBy->email,
                    $submission->created_at->format('Y-m-d H:i:s'),
                ];

                $submittedData = $submission->getSubmittedDataAsArray();
                foreach ($fields as $field) {
                    $value = '';
                    foreach ($submittedData as $data) {
                        if ($data['key'] === $field['key']) {
                            $value = is_array($data['value']) ? json_encode($data['value']) : $data['value'];
                            break;
                        }
                    }
                    $row[] = $value;
                }

                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Get form statistics
     */
    public function getStatistics(Request $request, Form $form)
    {
        // Authorization check
        if ($form->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $totalSubmissions = FormSubmission::where('form_id', $form->id)->count();
        $uniqueSubmitters = FormSubmission::where('form_id', $form->id)
            ->distinct('submitted_by')
            ->count();

        $submissionsByDate = FormSubmission::where('form_id', $form->id)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        $topSubmitters = FormSubmission::where('form_id', $form->id)
            ->with('submittedBy:id,name,email')
            ->selectRaw('submitted_by, COUNT(*) as submission_count')
            ->groupBy('submitted_by')
            ->orderBy('submission_count', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_submissions' => $totalSubmissions,
                'unique_submitters' => $uniqueSubmitters,
                'submissions_by_date' => $submissionsByDate,
                'top_submitters' => $topSubmitters->map(fn($item) => [
                    'user' => $item->submittedBy,
                    'submission_count' => $item->submission_count,
                ]),
            ],
            'form' => $form->only(['id', 'name', 'created_at']),
            'message' => 'Statistics retrieved successfully',
        ]);
    }
}
