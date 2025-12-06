<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
            'password' => Hash::make('password'),
            'role_id' => RoleType::SuperAdmin->value,
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role_id' => RoleType::Admin->value,
        ]);

        User::factory()->create([
            'name' => 'Standard User',
            'email' => 'user@gmail.com',
            'password' => Hash::make('password'),
            'role_id' => RoleType::User->value,
        ]);

        $this->call([
            ScreenAndFormSeeder::class,
        ]);
    }
}
