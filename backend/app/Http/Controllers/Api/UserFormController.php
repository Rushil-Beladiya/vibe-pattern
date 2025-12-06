<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;

final class UserFormController  
{
    public function show(FormSubmission $formSubmission): JsonResponse
    {
        $formSubmission->load('template:id,screen,fields');

        return response()->json([
            'responseCode' => 200,
            'responseText' => 'Form retrieved successfully.',
            'responseData' => [
                'screen_name' => $formSubmission->template->screen_name,
                'fields' => $formSubmission->template->fields,
                'submitted_data' => $formSubmission->submitted_data,
                'submitted_at' => $formSubmission->created_at,
            ],
        ]);
    }
}
