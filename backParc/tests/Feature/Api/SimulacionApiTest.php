<?php

namespace Tests\Feature\Api;

use App\Models\Celda;
use App\Models\Dinosaurio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SimulacionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_simulaciones(): void
    {
        $admin = User::factory()->create([
            'nick' => 'jp-sim-admin',
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin, ['read', 'admin']);

        $response = $this->getJson('/api/simulaciones');

        $response->assertOk()->assertExactJson([]);
    }

    public function test_admin_can_run_normal_simulation_for_one_celda(): void
    {
        $admin = User::factory()->create([
            'nick' => 'jp-normal-admin',
            'role' => 'admin',
        ]);

        $celda = Celda::create([
            'nombre' => 'Raptor 1',
            'fila' => 1,
            'columna' => 1,
            'nivel_seguridad' => 6,
            'cantidad_alimento' => 80,
            'averias_pendientes' => 1,
            'estado' => 'operativa',
        ]);

        Sanctum::actingAs($admin, ['read', 'admin']);

        $response = $this->postJson('/api/simulaciones/normal', [
            'celda_id' => $celda->id,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('tipo', 'normal')
            ->assertJsonPath('resumen.total_celdas', 1)
            ->assertJsonCount(1, 'resultados');
    }

    public function test_admin_can_run_breach_simulation(): void
    {
        $admin = User::factory()->create([
            'nick' => 'jp-brecha-admin',
            'role' => 'admin',
        ]);

        $celda = Celda::create([
            'nombre' => 'T-Rex 1',
            'fila' => 2,
            'columna' => 2,
            'nivel_seguridad' => 2,
            'cantidad_alimento' => 10,
            'averias_pendientes' => 4,
            'estado' => 'operativa',
        ]);

        Dinosaurio::create([
            'nick' => 'Rexy',
            'raza' => 'Tyrannosaurus rex',
            'dieta' => 'carnivoro',
            'nivel_peligrosidad' => 'extremo',
            'edad' => 12,
            'estado' => 'sano',
            'celda_id' => $celda->id,
        ]);

        Sanctum::actingAs($admin, ['read', 'admin']);

        $response = $this->postJson('/api/simulaciones/brecha', [
            'celda_id' => $celda->id,
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'simulacion_id',
                'resultado' => [
                    'celda' => ['id', 'nombre', 'fila', 'columna'],
                    'probabilidad_fuga',
                    'tirada',
                    'fuga_ocurre',
                    'estado_final',
                    'detalles',
                    'dinosaurios_en_riesgo',
                ],
            ]);
    }
}
