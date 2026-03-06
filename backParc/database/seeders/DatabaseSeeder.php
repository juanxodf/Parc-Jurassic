<?php

namespace Database\Seeders;

use App\Models\Celda;
use App\Models\Dinosaurio;
use App\Models\Tarea;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Usuarios ──────────────────────────────────────────────────
        $admin = User::create([
            'nick'     => 'hammond',
            'name'     => 'John Hammond',
            'email'    => 'admin@jurassicpark.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        $vet = User::create([
            'nick'     => 'ellie',
            'name'     => 'Ellie Sattler',
            'email'    => 'vet@jurassicpark.com',
            'password' => Hash::make('password'),
            'role'     => 'veterinario',
        ]);

        $mant = User::create([
            'nick'     => 'arnold',
            'name'     => 'Ray Arnold',
            'email'    => 'mant@jurassicpark.com',
            'password' => Hash::make('password'),
            'role'     => 'mantenimiento',
        ]);

        // ── Celdas (grid 3x3) ─────────────────────────────────────────
        $celdas = [
            ['nombre' => 'Sector A1', 'fila' => 0, 'columna' => 0, 'nivel_seguridad' => 9,  'cantidad_alimento' => 85, 'averias_pendientes' => 0, 'estado' => 'operativa'],
            ['nombre' => 'Sector A2', 'fila' => 0, 'columna' => 1, 'nivel_seguridad' => 7,  'cantidad_alimento' => 60, 'averias_pendientes' => 1, 'estado' => 'operativa'],
            ['nombre' => 'Sector A3', 'fila' => 0, 'columna' => 2, 'nivel_seguridad' => 5,  'cantidad_alimento' => 30, 'averias_pendientes' => 3, 'estado' => 'operativa'],
            ['nombre' => 'Sector B1', 'fila' => 1, 'columna' => 0, 'nivel_seguridad' => 8,  'cantidad_alimento' => 90, 'averias_pendientes' => 0, 'estado' => 'operativa'],
            ['nombre' => 'Sector B2', 'fila' => 1, 'columna' => 1, 'nivel_seguridad' => 3,  'cantidad_alimento' => 15, 'averias_pendientes' => 5, 'estado' => 'operativa'],
            ['nombre' => 'Sector B3', 'fila' => 1, 'columna' => 2, 'nivel_seguridad' => 6,  'cantidad_alimento' => 70, 'averias_pendientes' => 2, 'estado' => 'operativa'],
            ['nombre' => 'Sector C1', 'fila' => 2, 'columna' => 0, 'nivel_seguridad' => 10, 'cantidad_alimento' => 95, 'averias_pendientes' => 0, 'estado' => 'operativa'],
            ['nombre' => 'Sector C2', 'fila' => 2, 'columna' => 1, 'nivel_seguridad' => 4,  'cantidad_alimento' => 45, 'averias_pendientes' => 4, 'estado' => 'operativa'],
            ['nombre' => 'Sector C3', 'fila' => 2, 'columna' => 2, 'nivel_seguridad' => 2,  'cantidad_alimento' => 10, 'averias_pendientes' => 6, 'estado' => 'mantenimiento'],
        ];

        foreach ($celdas as $c) {
            Celda::create($c);
        }

        // ── Dinosaurios ───────────────────────────────────────────────
        $dinos = [
            ['nick' => 'Rex',     'raza' => 'Tyrannosaurus rex', 'edad' => 15, 'celda_id' => 7],
            ['nick' => 'Blue',    'raza' => 'Velociraptor',      'edad' => 8,  'celda_id' => 5],
            ['nick' => 'Delta',   'raza' => 'Velociraptor',      'edad' => 7,  'celda_id' => 5],
            ['nick' => 'Tricky',  'raza' => 'Triceratops',       'edad' => 12, 'celda_id' => 1],
            ['nick' => 'Brachie', 'raza' => 'Brachiosaurus',     'edad' => 20, 'celda_id' => 4],
            ['nick' => 'Spino',   'raza' => 'Spinosaurus',       'edad' => 10, 'celda_id' => 9],
            ['nick' => 'Anky',    'raza' => 'Ankylosaurus',      'edad' => 6,  'celda_id' => 2],
            ['nick' => 'Gigante', 'raza' => 'Giganotosaurus',    'edad' => 18, 'celda_id' => 6],
            ['nick' => 'Indy',    'raza' => 'Indominus rex',     'edad' => 3,  'celda_id' => 3],
        ];

        foreach ($dinos as $d) {
            $defaults = Dinosaurio::RAZAS[$d['raza']];
            Dinosaurio::create(array_merge($d, $defaults, ['estado' => 'sano']));
        }

        // ── Tareas de ejemplo ─────────────────────────────────────────
        Tarea::create([
            'celda_id'    => 3,
            'user_id'     => $mant->id,
            'tipo'        => 'mantenimiento',
            'descripcion' => 'Reparar cercado eléctrico sector A3',
            'estado'      => 'pendiente',
        ]);

        Tarea::create([
            'celda_id'    => 5,
            'user_id'     => $vet->id,
            'tipo'        => 'veterinario',
            'descripcion' => 'Revisar estado velociraptors sector B2',
            'estado'      => 'en_progreso',
            'iniciada_en' => now(),
        ]);

        Tarea::create([
            'celda_id'    => 9,
            'user_id'     => $mant->id,
            'tipo'        => 'mantenimiento',
            'descripcion' => 'Revisar 6 averías pendientes sector C3',
            'estado'      => 'pendiente',
        ]);
    }
}
