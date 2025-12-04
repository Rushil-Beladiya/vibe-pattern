<?php

namespace Database\Seeders;

use App\Enums\ScreenType;
use App\Models\FormTemplate;
use Illuminate\Database\Seeder;

class FormTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            ScreenType::Home->value => [
                'name' => 'user',
                'fields' => [
                    [
                        'key' => 'headline',
                        'label' => 'Headline',
                        'type' => 'text',
                        'placeholder' => 'Enter the primary headline',
                        'required' => true,
                        'options' => [],
                    ],
                    [
                        'key' => 'subheading',
                        'label' => 'Subheading',
                        'type' => 'textarea',
                        'placeholder' => 'Add a short supporting message',
                        'required' => true,
                        'options' => [],
                    ],
                    [
                        'key' => 'cta_text',
                        'label' => 'CTA Text',
                        'type' => 'text',
                        'placeholder' => 'Enter the CTA button label',
                        'required' => true,
                        'options' => [],
                    ],
                    [
                        'key' => 'hero_image',
                        'label' => 'Hero Image',
                        'type' => 'image',
                        'placeholder' => null,
                        'required' => true,
                        'options' => [],
                    ],
                ],
            ],
            ScreenType::Vibro->value => [
                'name' => 'user',
                'fields' => [
                    [
                        'key' => 'vibration_mode',
                        'label' => 'Vibration Mode',
                        'type' => 'select',
                        'placeholder' => 'Pick a mode',
                        'required' => true,
                        'options' => ['Pulse', 'Wave', 'Boost'],
                    ],
                    [
                        'key' => 'intensity_level',
                        'label' => 'Intensity Level',
                        'type' => 'number',
                        'placeholder' => '1 - 10',
                        'required' => true,
                        'options' => [],
                    ],
                    [
                        'key' => 'session_notes',
                        'label' => 'Session Notes',
                        'type' => 'textarea',
                        'placeholder' => 'Optional notes about the session',
                        'required' => false,
                        'options' => [],
                    ],
                    [
                        'key' => 'audio_track',
                        'label' => 'Audio Track',
                        'type' => 'file',
                        'placeholder' => null,
                        'required' => false,
                        'options' => [],
                    ],
                ],
            ],
            ScreenType::Profile->value => [
                'name' => 'user',
                'fields' => [
                    [
                        'key' => 'display_name',
                        'label' => 'Display Name',
                        'type' => 'text',
                        'placeholder' => 'Enter display name',
                        'required' => true,
                        'options' => [],
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email Address',
                        'type' => 'email',
                        'placeholder' => 'user@example.com',
                        'required' => true,
                        'options' => [],
                    ],
                    [
                        'key' => 'bio',
                        'label' => 'Bio',
                        'type' => 'textarea',
                        'placeholder' => 'Tell us about yourself',
                        'required' => false,
                        'options' => [],
                    ],
                    [
                        'key' => 'notifications',
                        'label' => 'Enable Notifications',
                        'type' => 'checkbox',
                        'placeholder' => null,
                        'required' => false,
                        'options' => [],
                    ],
                    [
                        'key' => 'avatar',
                        'label' => 'Profile Photo',
                        'type' => 'image',
                        'placeholder' => null,
                        'required' => false,
                        'options' => [],
                    ],
                ],
            ],
        ];

        foreach ($templates as $screen => $template) {
            FormTemplate::updateOrCreate(
                ['screen' => $screen, 'name' => $template['name']],
                ['fields' => $template['fields']]
            );
        }
    }
}
