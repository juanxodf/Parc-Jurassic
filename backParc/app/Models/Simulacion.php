<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Simulacion extends Model
{
    protected $table = 'simulaciones';

    protected $fillable = [
        'tipo',
        'user_id',
        'celda_id',
        'resultado',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'resultado' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function celda()
    {
        return $this->belongsTo(Celda::class);
    }
}
