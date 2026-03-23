<?php

namespace App\Http\Requests\Simulacion;

use Illuminate\Foundation\Http\FormRequest;

class NormalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'celda_id' => 'nullable|exists:celdas,id',
        ];
    }
}
