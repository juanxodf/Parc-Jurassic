<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nick' => 'required|string|max:50|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:admin,veterinario,mantenimiento',
        ];
    }

    public function messages(): array
    {
        return [
            'nick.unique' => 'El nick ya está en uso.',
            'email.unique' => 'El email ya está registrado.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }
}
