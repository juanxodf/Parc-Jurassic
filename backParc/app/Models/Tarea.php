<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    protected $fillable = [
        'celda_id',
        'user_id',
        'tipo',
        'estado',
        'descripcion',
        'iniciada_en',
        'finalizada_en',
    ];

    protected function casts(): array
    {
        return [
            'iniciada_en'   => 'datetime',
            'finalizada_en' => 'datetime',
        ];
    }

    public function celda()
    {
        return $this->belongsTo(Celda::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function iniciar(): void
    {
        $this->update(['estado' => 'en_progreso', 'iniciada_en' => now()]);
    }

    public function finalizar(): void
    {
        $this->update(['estado' => 'finalizada', 'finalizada_en' => now()]);
    }
}
