<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Screen;
use App\Models\User;
use Illuminate\Database\Seeder;

final class ScreenAndFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::where('role_id', '1')->first();

        if (! $superAdmin) {
            $this->command->error('Super admin user not found! Please run the main seeder first.');

            return;
        }

        // Create example screens (prefer .png icons; fall back to .svg if .png missing)
        $musicScreen = Screen::create([
            'name' => 'Music',
            'slug' => 'music',
            'icon' => $this->iconPath('music'),
            'type' => 'bottom',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $vibroScreen = Screen::create([
            'name' => 'Vibro',
            'slug' => 'vibro',
            'icon' => $this->iconPath('vibro'),
            'type' => 'bottom',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $profileScreen = Screen::create([
            'name' => 'Profile',
            'slug' => 'profile',
            'icon' => $this->iconPath('user'),
            'type' => 'sidedrawer',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // Create example form for Music screen
        Form::create([
            'screen_id' => $musicScreen->id,
            'name' => 'Music Form',
            'fields' => [
                [
                    'label' => 'Music Name',
                    'key' => 'music_name',
                    'type' => 'text',
                    'value' => '',
                    'placeholder' => 'Enter music name',
                    'required' => true,
                ],
                [
                    'label' => 'Cover Image',
                    'key' => 'cover_image',
                    'type' => 'image',
                    'value' => '',
                    'required' => false,
                ],
                [
                    'label' => 'Music File',
                    'key' => 'music_file',
                    'type' => 'file',
                    'value' => '',
                    'allowed_mimes' => ['audio/mpeg', 'audio/mp3'],
                    'required' => true,
                ],
                [
                    'label' => 'Category',
                    'key' => 'category',
                    'type' => 'select',
                    'value' => '',
                    'options' => ['Animal Song', 'Kids Song', 'Bhajan', 'Pop'],
                    'required' => false,
                ],
                [
                    'label' => 'Description',
                    'key' => 'description',
                    'type' => 'textarea',
                    'value' => '',
                    'placeholder' => 'Enter description',
                    'required' => false,
                ],
            ],
            'is_active' => true,
            'created_by' => $superAdmin->id,
        ]);

        // Create example form for Vibro screen
        $vibroForm = Form::create([
            'screen_id' => $vibroScreen->id,
            'name' => 'Vibro Pattern Form',
            'fields' => [
                [
                    'label' => 'Pattern Name',
                    'key' => 'pattern_name',
                    'type' => 'text',
                    'value' => '',
                    'placeholder' => 'Enter pattern name',
                    'required' => true,
                ],
                [
                    'label' => 'Duration (seconds)',
                    'key' => 'duration',
                    'type' => 'text',
                    'value' => '',
                    'placeholder' => 'Enter duration',
                    'required' => true,
                ],
                [
                    'label' => 'Intensity',
                    'key' => 'intensity',
                    'type' => 'select',
                    'value' => '',
                    'options' => ['Low', 'Medium', 'High'],
                    'required' => true,
                ],
                [
                    'label' => 'Enable Vibration',
                    'key' => 'enable_vibration',
                    'type' => 'checkbox',
                    'value' => '',
                    'required' => false,
                ],
            ],
            'is_active' => true,
            'created_by' => $superAdmin->id,
        ]);

        // Seed an example vibration pattern submission for the Vibro form
        $pattern = [
            'id' => 1,
            'name' => 'Pattern A',
            'pattern_ms' => [100, 200, 100, 300, 150],
            'intensity_values' => [0, 100, 200, 100, 300],
            'notes' => 'Each value maps to vibration intensity at the corresponding duration in pattern_ms.',
        ];

        $submittedData = [
            [
                'key' => 'pattern_name',
                'label' => 'Pattern Name',
                'type' => 'text',
                'value' => $pattern['name'],
                'required' => true,
            ],
            [
                'key' => 'duration',
                'label' => 'Duration (seconds)',
                'type' => 'text',
                'value' => array_sum($pattern['pattern_ms']) / 1000,
                'required' => true,
            ],
            [
                'key' => 'intensity',
                'label' => 'Intensity',
                'type' => 'select',
                'value' => 'Custom',
                'required' => true,
            ],
            [
                'key' => 'enable_vibration',
                'label' => 'Enable Vibration',
                'type' => 'checkbox',
                'value' => true,
                'required' => false,
            ],
            [
                'key' => 'vibration_pattern',
                'label' => 'Vibration Pattern',
                'type' => 'json',
                'value' => $pattern,
                'required' => false,
            ],
        ];

        FormSubmission::create([
            'form_id' => $vibroForm->id,
            'submitted_by' => $superAdmin->id,
            'submitted_data' => $submittedData,
            'submission_number' => FormSubmission::generateSubmissionNumber(),
        ]);

        // Create example form for Profile screen
        Form::create([
            'screen_id' => $profileScreen->id,
            'name' => 'User Profile Form',
            'fields' => [
                [
                    'label' => 'Full Name',
                    'key' => 'full_name',
                    'type' => 'text',
                    'value' => '',
                    'placeholder' => 'Enter full name',
                    'required' => true,
                ],
                [
                    'label' => 'Profile Picture',
                    'key' => 'profile_picture',
                    'type' => 'image',
                    'value' => '',
                    'required' => false,
                ],
                [
                    'label' => 'Date of Birth',
                    'key' => 'date_of_birth',
                    'type' => 'date',
                    'value' => '',
                    'required' => false,
                ],
                [
                    'label' => 'Bio',
                    'key' => 'bio',
                    'type' => 'textarea',
                    'value' => '',
                    'placeholder' => 'Tell us about yourself',
                    'required' => false,
                ],
            ],
            'is_active' => true,
            'created_by' => $superAdmin->id,
        ]);

        $this->command->info('Screens and forms seeded successfully!');
    }

    /**
     * Return public icon path preferring PNG when available.
     */
    private function iconPath(string $name): string
    {
        $png = public_path("storage/icons/{$name}.png");

        if (file_exists($png)) {
            return "/storage/icons/{$name}.png";
        }

        return "/storage/icons/{$name}.svg";
    }
}
