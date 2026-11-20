<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRequest;
use App\Models\RequestMedia;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

class RequestController extends Controller
{
    private const WITH = ['requester', 'assignee', 'media'];

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = MaintenanceRequest::with(self::WITH)->latest('id');

        if ($user->role === 'user') {
            $query->where('requester_id', $user->id);
        } elseif ($user->role === 'maintenance') {
            $query->where('assignee_id', $user->id);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->get()->map->toApi()->values());
    }

    public function show(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $user = $request->user();
        $allowed = $user->role === 'admin'
            || ($user->role === 'user' && $maintenanceRequest->requester_id === $user->id)
            || ($user->role === 'maintenance' && $maintenanceRequest->assignee_id === $user->id);
        abort_unless($allowed, 403, 'You cannot view this request.');

        return response()->json($maintenanceRequest->load(self::WITH)->toApi());
    }

    /** Users create requests. Duplicates of an open request are rejected with 409. */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'user', 403, 'Only users can create requests.');

        $data = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'required|string|max:2000',
            'category' => ['required', Rule::in(MaintenanceRequest::CATEGORIES)],
            'location' => 'required|string|max:255',
            'priority' => ['required', Rule::in(MaintenanceRequest::PRIORITIES)],
            'images' => 'required|array|min:1|max:6',
            'images.*' => 'image|max:5120', // 5 MB each
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska|max:51200', // 50 MB
        ]);

        $fingerprint = MaintenanceRequest::fingerprint($data['category'], $data['location'], $data['title']);

        // 1) Friendly check before we touch any files.
        if ($existing = MaintenanceRequest::where('open_fingerprint', $fingerprint)->first()) {
            return $this->duplicate($existing);
        }

        $stored = [];
        try {
            // 2) The UNIQUE index on open_fingerprint is the real guard: if two identical reports
            //    arrive at the same moment, the second insert fails and is reported as a duplicate.
            $req = DB::transaction(function () use ($data, $user, $fingerprint, &$stored) {
                $req = MaintenanceRequest::create([
                    'title' => trim($data['title']),
                    'description' => trim($data['description']),
                    'category' => $data['category'],
                    'location' => trim($data['location']),
                    'priority' => $data['priority'],
                    'status' => 'Pending',
                    'requester_id' => $user->id,
                    'fingerprint' => $fingerprint,
                ]);
                $req->update(['code' => 'FX-'.(2048 + $req->id)]);

                foreach ($data['images'] as $file) {
                    $path = $file->store("requests/{$req->id}", 'public');
                    $stored[] = $path;
                    $req->media()->create(['type' => 'image', 'path' => $path, 'original_name' => $file->getClientOriginalName()]);
                }
                $path = $data['video']->store("requests/{$req->id}", 'public');
                $stored[] = $path;
                $req->media()->create(['type' => 'video', 'path' => $path, 'original_name' => $data['video']->getClientOriginalName()]);

                return $req;
            });
        } catch (UniqueConstraintViolationException) {
            Storage::disk('public')->delete($stored);
            $existing = MaintenanceRequest::where('open_fingerprint', $fingerprint)->first();

            return $existing
                ? $this->duplicate($existing)
                : response()->json(['message' => 'A report for this issue is already open.'], 409);
        } catch (Throwable $e) {
            Storage::disk('public')->delete($stored);
            throw $e;
        }

        return response()->json($req->load(self::WITH)->toApi(), 201);
    }

    public function approve(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $this->requireRole($request, 'admin');

        return $this->transition($maintenanceRequest, ['Pending'], ['status' => 'Approved', 'decline_reason' => null]);
    }

    public function decline(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $this->requireRole($request, 'admin');
        $data = $request->validate(['reason' => 'required|string|max:500']);

        return $this->transition($maintenanceRequest, ['Pending'], ['status' => 'Declined', 'decline_reason' => trim($data['reason'])]);
    }

    public function assign(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $this->requireRole($request, 'admin');
        $data = $request->validate(['staff_id' => 'required|integer']);
        $staff = User::where('id', $data['staff_id'])->where('role', 'maintenance')->first();
        if (! $staff) {
            return response()->json(['message' => 'That person is not a maintenance team member.'], 422);
        }

        return $this->transition($maintenanceRequest, ['Approved', 'Assigned'], ['status' => 'Assigned', 'assignee_id' => $staff->id]);
    }

    public function start(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $this->requireAssignee($request, $maintenanceRequest);

        return $this->transition($maintenanceRequest, ['Assigned'], ['status' => 'In Progress']);
    }

    public function resolve(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $this->requireAssignee($request, $maintenanceRequest);

        return $this->transition($maintenanceRequest, ['In Progress'], ['status' => 'Resolved']);
    }

    // ---- helpers ----

    private function duplicate(MaintenanceRequest $existing): JsonResponse
    {
        return response()->json([
            'message' => "A report for this issue is already open ({$existing->code}). Please wait for it to be resolved.",
            'duplicate_of' => $existing->code,
        ], 409);
    }

    private function requireRole(Request $request, string $role): void
    {
        abort_unless($request->user()->role === $role, 403, "Only {$role} accounts can do this.");
    }

    private function requireAssignee(Request $request, MaintenanceRequest $r): void
    {
        $user = $request->user();
        abort_unless($user->role === 'maintenance' && $r->assignee_id === $user->id, 403, 'This request is not assigned to you.');
    }

    private function transition(MaintenanceRequest $r, array $allowedFrom, array $changes): JsonResponse
    {
        abort_unless(in_array($r->status, $allowedFrom, true), 409, "This request is {$r->status} and cannot be changed that way.");
        $r->update($changes);

        return response()->json($r->load(self::WITH)->toApi());
    }
}
