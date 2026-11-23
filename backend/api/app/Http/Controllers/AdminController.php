<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\Schedule;
use App\Models\User;
use App\Models\WorkspaceSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    private function requireAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Only admin accounts can do this.');
    }

    // ---- Facilities ----

    public function facilities(): JsonResponse
    {
        return response()->json(Facility::orderBy('id')->get()->map->toApi());
    }

    public function addFacility(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'name' => 'required|string|max:150',
            'details' => 'nullable|string|max:255',
            'condition' => ['required', Rule::in(['Good', 'Attention'])],
            'condition_percent' => 'required|integer|min:0|max:100',
            'open_issues' => 'nullable|integer|min:0',
        ]);

        $facility = Facility::create([
            'name' => trim($data['name']),
            'details' => trim($data['details'] ?? ''),
            'condition' => $data['condition'],
            'condition_percent' => $data['condition_percent'],
            'open_issues' => $data['open_issues'] ?? 0,
        ]);

        return response()->json($facility->toApi(), 201);
    }

    // ---- Schedule ----

    public function schedules(): JsonResponse
    {
        return response()->json(Schedule::orderBy('id')->get()->map->toApi());
    }

    public function addSchedule(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'time' => 'required|string|max:40',
            'title' => 'required|string|max:150',
            'location' => 'nullable|string|max:255',
            'assignee' => 'nullable|string|max:150',
            'status' => ['required', Rule::in(['Upcoming', 'In progress', 'Completed'])],
            'duration' => 'nullable|string|max:40',
        ]);

        $schedule = Schedule::create([
            'time' => trim($data['time']),
            'title' => trim($data['title']),
            'location' => trim($data['location'] ?? ''),
            'assignee' => trim($data['assignee'] ?? ''),
            'status' => $data['status'],
            'duration' => trim($data['duration'] ?? '30-60 min'),
        ]);

        return response()->json($schedule->toApi(), 201);
    }

    // ---- Settings ----

    public function settings(): JsonResponse
    {
        return response()->json(
            WorkspaceSetting::all()->pluck('value', 'key')->toArray(),
        );
    }

    public function saveSettings(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'workspace_name' => 'required|string|max:150',
            'system_name' => 'required|string|max:150',
            'timezone' => 'required|string|max:100',
        ]);

        foreach ($data as $key => $value) {
            WorkspaceSetting::updateOrCreate(
                ['key' => $key],
                ['value' => trim($value)],
            );
        }

        return response()->json($data);
    }

    // ---- Maintenance team ----

    public function addStaff(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'title' => 'nullable|string|max:150',
            'specialty' => 'nullable|string|max:150',
        ]);

        $staff = User::create([
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'password' => Hash::make($data['password']),
            'role' => 'maintenance',
            'title' => trim($data['title'] ?? 'Maintenance technician'),
            'specialty' => trim($data['specialty'] ?? 'General'),
        ]);

        return response()->json($staff->toSession(), 201);
    }
}
