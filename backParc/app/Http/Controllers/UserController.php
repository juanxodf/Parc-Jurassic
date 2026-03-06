<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::select('id', 'nick', 'name', 'email', 'role', 'photo', 'created_at')->get();

        return response()->json($users, 200);
    }

    public function show(User $usuario): JsonResponse
    {
        $usuario->load('tareas.celda:id,nombre');

        return response()->json($usuario, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nick'     => 'required|string|max:50|unique:users',
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:admin,veterinario,mantenimiento',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'nick'     => $request->nick,
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $usuario): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nick'     => 'sometimes|string|max:50|unique:users,nick,' . $usuario->id,
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $usuario->id,
            'password' => 'sometimes|string|min:8',
            'role'     => 'sometimes|in:admin,veterinario,mantenimiento',
            'photo'    => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['nick', 'name', 'email', 'role', 'photo']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $usuario->update($data);

        return response()->json($usuario, 200);
    }

    public function destroy(Request $request, User $usuario): JsonResponse
    {
        if ($usuario->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo.'], 403);
        }

        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.'], 200);
    }
}
