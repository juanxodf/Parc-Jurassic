<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = $data['role'] ?? 'veterinario';

        $user = User::create([
            'nick' => $data['nick'],
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $role,
        ]);

        $abilities = $role === 'admin' ? ['read', 'admin'] : ['read'];
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        $user->tokens()->delete();

        $abilities = $user->role === 'admin' ? ['read', 'admin'] : ['read'];
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.'], 200);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()), 200);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except('photo');

        if ($request->filled('name')) {
            $data['name'] = $request->name;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $path = $request->file('photo')->store('avatars', 'public');
            $data['photo'] = $path;
        }

        $user->update($data);

        return response()->json(new UserResource($user->fresh()), 200);
    }
}
