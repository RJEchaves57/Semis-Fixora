<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|max:100',
            'role' => ['required', Rule::in(['user', 'admin', 'maintenance'])],
            'specialty' => 'nullable|string|max:100',
            'code' => 'nullable|string|max:100',
        ]);

        if ($data['role'] !== 'user') {
            $expected = config('fixora.staff_codes.'.$data['role']);
            if (! $expected || ! hash_equals($expected, (string) ($data['code'] ?? ''))) {
                return response()->json(['message' => 'Invalid staff access code.'], 422);
            }
        }

        $user = User::create([
            'name' => trim($data['name']),
            'email' => strtolower(trim($data['email'])),
            'password' => $data['password'], // hashed by the model cast
            'role' => $data['role'],
            'title' => match ($data['role']) {
                'admin' => 'Administrator',
                'maintenance' => 'Maintenance technician',
                default => 'Student / Staff',
            },
            'specialty' => $data['role'] === 'maintenance' ? ($data['specialty'] ?? null) : null,
        ]);

        return response()->json([
            'user' => $user->toSession(),
            'token' => $user->createToken('fixora')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => ['required', Rule::in(['user', 'admin', 'maintenance'])],
        ]);

        $user = User::where('email', strtolower(trim($data['email'])))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect email or password.'], 401);
        }
        if ($user->role !== $data['role']) {
            return response()->json(['message' => 'This account does not belong to the selected role.'], 403);
        }

        return response()->json([
            'user' => $user->toSession(),
            'token' => $user->createToken('fixora')->plainTextToken,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->toSession());
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }
}
