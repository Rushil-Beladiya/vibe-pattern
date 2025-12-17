<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

final class FormSubmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch all forms
        $forms = Form::all();

        // Number of submissions per admin per form (configurable)
        $perAdminSubmissions = (int) config('database.seeds.form_submissions_per_admin', 5) ?: 5;

        // Fetch all users with Admin role
        $admins = User::where('role_id', RoleType::Admin->value)->get();

        // Fallback: if no admins found, try any non-super-admin users
        if ($admins->isEmpty()) {
            Log::warning('No admin users found for FormSubmissionSeeder. Falling back to non-super-admin users.');
            $admins = User::where('role_id', '<>', RoleType::SuperAdmin->value)->get();
        }

        // Final fallback: if still empty, use first available user
        if ($admins->isEmpty()) {
            $first = User::first();
            if ($first) {
                $admins = collect([$first]);
            }
        }

        // Loop through each form and create submissions
        foreach ($forms as $form) {
            foreach ($admins as $admin) {
                // Create configured number of submissions per admin per form
                for ($i = 1; $i <= $perAdminSubmissions; $i++) {
                    FormSubmission::create([
                        'form_id' => $form->id,
                        'submitted_by' => $admin->id,
                        'submitted_data' => $this->generateFakeFormData($form),
                        'submission_number' => FormSubmission::generateSubmissionNumber(),
                    ]);
                }
            }
        }
    }

    /**
     * Generate fake form data based on the form's fields.
     */
    private function generateFakeFormData(Form $form): array
    {
        $fields = $form->getFieldsAsArray();
        $fakeData = [];

        foreach ($fields as $field) {
            $fakeData[] = [
                'key' => $field['key'],
                'label' => $field['label'],
                'type' => $field['type'],
                'value' => $this->generateFakeValue($field['type']),
                'required' => $field['required'] ?? false,
            ];
        }

        return $fakeData;
    }

    /**
     * Generate fake value based on field type.
     */
    private function generateFakeValue(string $type): mixed
    {
        return match ($type) {
            'text' => fake()->name(),
            'email' => fake()->safeEmail(),
            'tel' => fake()->phoneNumber(),
            'number' => fake()->randomNumber(),
            'date' => fake()->date(),
            'image', 'file' => fake()->imageUrl(),
            default => fake()->word(),
        };
        
    }
    
}