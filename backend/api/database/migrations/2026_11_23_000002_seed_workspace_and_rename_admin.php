<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'admin@fixora.edu')
            ->where('name', 'Admin User')
            ->update(['name' => 'Admin']);

        if (DB::table('facilities')->count() === 0) {
            DB::table('facilities')->insert([
                ['name' => 'Main Building', 'details' => '28 rooms · 4 floors', 'condition' => 'Good', 'condition_percent' => 92, 'open_issues' => 0, 'created_at' => now()],
                ['name' => 'Building A', 'details' => '18 rooms · 3 floors', 'condition' => 'Good', 'condition_percent' => 86, 'open_issues' => 2, 'created_at' => now()],
                ['name' => 'Building B', 'details' => '22 rooms · 3 floors', 'condition' => 'Attention', 'condition_percent' => 74, 'open_issues' => 3, 'created_at' => now()],
                ['name' => 'Science & Technology', 'details' => '12 labs · 2 floors', 'condition' => 'Good', 'condition_percent' => 96, 'open_issues' => 0, 'created_at' => now()],
                ['name' => 'Sports Complex', 'details' => 'Gym · 2 courts', 'condition' => 'Good', 'condition_percent' => 89, 'open_issues' => 1, 'created_at' => now()],
                ['name' => 'Library', 'details' => 'Reading areas · 3 floors', 'condition' => 'Good', 'condition_percent' => 98, 'open_issues' => 0, 'created_at' => now()],
            ]);
        }

        if (DB::table('schedules')->count() === 0) {
            DB::table('schedules')->insert([
                ['time' => '09:00 AM', 'title' => 'Electrical inspection', 'location' => 'Building A · Floor 2', 'assignee' => 'R. Dela Cruz', 'status' => 'Completed', 'duration' => '45 min', 'created_at' => now()],
                ['time' => '11:30 AM', 'title' => 'Lab faucet repair', 'location' => 'Science Lab · Building C', 'assignee' => 'M. Garcia', 'status' => 'In progress', 'duration' => '30-60 min', 'created_at' => now()],
                ['time' => '02:00 PM', 'title' => 'Aircon maintenance', 'location' => 'Faculty Room · Main', 'assignee' => 'J. Lim', 'status' => 'Upcoming', 'duration' => '30-60 min', 'created_at' => now()],
                ['time' => '03:30 PM', 'title' => 'Classroom safety check', 'location' => 'Building B · Room 105', 'assignee' => 'A. Perez', 'status' => 'Upcoming', 'duration' => '30-60 min', 'created_at' => now()],
            ]);
        }

        foreach ([
            'workspace_name' => 'Northfield Campus',
            'system_name' => 'FIXORA School Maintenance',
            'timezone' => 'Asia/Manila',
        ] as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()],
            );
        }
    }

    public function down(): void
    {
        // Data only; no schema to roll back.
    }
};
