<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /** Maintenance team members, for the admin's "assign to" list. */
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Only admins can list staff.');

        return response()->json(
            User::where('role', 'maintenance')->orderBy('name')->get()->map->toSession()->values()
        );
    }
}
