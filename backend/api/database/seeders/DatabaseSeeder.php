<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Demo accounts, same as the React demo. Change or remove before going live. */
    public function run(): void
    {
        $accounts = [
            ['Maria Santos', 'user@fixora.edu', 'user123', 'user', 'Teacher', null],
            ['Admin', 'admin@fixora.edu', 'admin123', 'admin', 'System administrator', null],
            ['Rafael Dela Cruz', 'rafael@fixora.edu', 'team123', 'maintenance', 'Electrical technician', 'Electrical'],
            ['Michelle Garcia', 'michelle@fixora.edu', 'team123', 'maintenance', 'Maintenance technician', 'Plumbing'],
            ['James Lim', 'james@fixora.edu', 'team123', 'maintenance', 'Facilities specialist', 'HVAC'],
            ['Andrea Perez', 'andrea@fixora.edu', 'team123', 'maintenance', 'General maintenance', 'Carpentry'],
        ];

        foreach ($accounts as [$name, $email, $password, $role, $title, $specialty]) {
            User::updateOrCreate(
                ['email' => $email],
                compact('name', 'password', 'role', 'title', 'specialty'),
            );
        }
    }
}
