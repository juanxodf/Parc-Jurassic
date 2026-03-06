<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dinosaurio extends Model
{
    protected $fillable = [
        'nick',
        'raza',
        'dieta',
        'nivel_peligrosidad',
        'edad',
        'descripcion',
        'estado',
        'celda_id',
    ];

    public const RAZAS = [
        'Triceratops'       => ['dieta' => 'herbivoro',  'nivel_peligrosidad' => 'medio'],
        'Brachiosaurus'     => ['dieta' => 'herbivoro',  'nivel_peligrosidad' => 'bajo'],
        'Stegosaurus'       => ['dieta' => 'herbivoro',  'nivel_peligrosidad' => 'medio'],
        'Ankylosaurus'      => ['dieta' => 'herbivoro',  'nivel_peligrosidad' => 'medio'],
        'Parasaurolophus'   => ['dieta' => 'herbivoro',  'nivel_peligrosidad' => 'bajo'],
        'Gallimimus'        => ['dieta' => 'herbivoro',  'nivel_peligrosidad' => 'bajo'],
        'Oviraptor'         => ['dieta' => 'omnivoro',   'nivel_peligrosidad' => 'medio'],
        'Ornitholestes'     => ['dieta' => 'omnivoro',   'nivel_peligrosidad' => 'medio'],
        'Therizinosaurus'   => ['dieta' => 'omnivoro',   'nivel_peligrosidad' => 'alto'],
        'Velociraptor'      => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'muy_alto'],
        'Dilophosaurus'     => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'muy_alto'],
        'Carnotaurus'       => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'muy_alto'],
        'Allosaurus'        => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'muy_alto'],
        'Tyrannosaurus rex' => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'extremo'],
        'Spinosaurus'       => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'extremo'],
        'Giganotosaurus'    => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'extremo'],
        'Indominus rex'     => ['dieta' => 'carnivoro',  'nivel_peligrosidad' => 'critico'],
    ];

    public function celda()
    {
        return $this->belongsTo(Celda::class);
    }
}
