<?php

namespace Database\Seeders;

use App\Models\Screen;
use App\Models\Form;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScreenAndFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::where('role_id', '1')->first();

        if (!$superAdmin) {
            $this->command->error('Super admin user not found! Please run the main seeder first.');
            return;
        }

        // Create example screens
        $musicScreen = Screen::create([
            'name' => 'Music',
            'slug' => 'music',
            'icon' => 'musical-notes',
            'type' => 'bottom',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $vibroScreen = Screen::create([
            'name' => 'Vibro',
            'slug' => 'vibro',
            'icon' => 'pulse',
            'type' => 'bottom',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $profileScreen = Screen::create([
            'name' => 'Profile',
            'slug' => 'profile',
            'icon' => 'person',
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
        Form::create([
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
}
