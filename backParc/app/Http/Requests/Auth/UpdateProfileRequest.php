<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:8|confirmed',
            'photo' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }
}
