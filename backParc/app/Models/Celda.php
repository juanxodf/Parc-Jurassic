<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Celda extends Model
{
    protected $fillable = [
        'nombre',
        'fila',
        'columna',
        'nivel_seguridad',
        'cantidad_alimento',
        'averias_pendientes',
        'estado',
        'notas',
    ];

    public function dinosaurios()
    {
        return $this->hasMany(Dinosaurio::class);
    }

    public function tareas()
    {
        return $this->hasMany(Tarea::class);
    }

    public function simulaciones()
    {
        return $this->hasMany(Simulacion::class);
    }
}
