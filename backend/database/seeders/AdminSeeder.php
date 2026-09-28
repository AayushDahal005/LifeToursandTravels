<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@lifetours.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'phone' => '9800000000',
                'address' => 'Kathmandu, Nepal',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}