<?php

namespace App\Http\Controllers;

use App\Models\Celda;
use App\Models\Simulacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SimulacionController extends Controller
{
    public function normal(Request $request): JsonResponse
    {
        $celdas    = Celda::with('dinosaurios')->get();
        $resultados = [];

        foreach ($celdas as $celda) {
            $bajada      = rand(10, 35);
            $nuevaComida  = max(0, $celda->cantidad_alimento - $bajada);
            $nuevasAverias = $celda->averias_pendientes + rand(0, 3);

            $celda->update([
                'cantidad_alimento'  => $nuevaComida,
                'averias_pendientes' => $nuevasAverias,
            ]);

            $alertas = [];
            if ($nuevaComida < 20)  $alertas[] = 'Alimento crítico';
            if ($nuevasAverias > 3) $alertas[] = 'Muchas averías pendientes';
            if ($nuevaComida < 10 && $celda->dinosaurios->count() > 0) {
                $alertas[] = 'Dinosaurios agresivos por hambre';
            }

            $resultados[] = [
                'celda_id'          => $celda->id,
                'nombre'            => $celda->nombre,
                'fila'              => $celda->fila,
                'columna'           => $celda->columna,
                'alimento_anterior' => $celda->getOriginal('cantidad_alimento'),
                'alimento_actual'   => $nuevaComida,
                'averias'           => $nuevasAverias,
                'alertas'           => $alertas,
                'requiere_atencion' => count($alertas) > 0,
            ];
        }

        $sim = Simulacion::create([
            'tipo'      => 'normal',
            'user_id'   => $request->user()->id,
            'resultado' => ['celdas' => $resultados],
        ]);

        return response()->json([
            'simulacion_id' => $sim->id,
            'tipo'          => 'normal',
            'resultados'    => $resultados,
            'resumen'       => [
                'total_celdas'     => count($resultados),
                'requieren_atencion' => count(array_filter($resultados, fn($r) => $r['requiere_atencion'])),
            ],
        ], 200);
    }

    public function brecha(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'celda_id' => 'nullable|exists:celdas,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $celda = $request->filled('celda_id')
            ? Celda::with('dinosaurios')->findOrFail($request->celda_id)
            : Celda::with('dinosaurios')->inRandomOrder()->first();

        if (!$celda) {
            return response()->json(['message' => 'No hay celdas disponibles.'], 422);
        }

        $pesoSeguridad = (10 - $celda->nivel_seguridad) * 8;
        $pesoPeligro   = min(50, $celda->dinosaurios->sum(function ($d) {
            $pesos = ['bajo' => 1, 'medio' => 2, 'alto' => 3, 'muy_alto' => 5, 'extremo' => 8, 'critico' => 12];
            return $pesos[$d->nivel_peligrosidad] ?? 0;
        }));
        $pesoAverias = min(30, $celda->averias_pendientes * 5);
        $pesoComida  = $celda->cantidad_alimento < 20 ? 15 : 0;

        $probabilidad = min(95, $pesoSeguridad + $pesoPeligro + $pesoAverias + $pesoComida);
        $tirada       = rand(1, 100);
        $fugaOcurre   = $tirada <= $probabilidad;

        $detalles    = [];
        $estadoFinal = 'contenida';

        if ($fugaOcurre) {
            $celda->update(['estado' => 'brecha']);
            $estadoFinal = 'desastre';
            $detalles[]  = "BRECHA EN {$celda->nombre}";

            if ($celda->dinosaurios->where('dieta', 'carnivoro')->count() > 0) {
                $detalles[]  = 'Carnívoros sueltos. Personal en peligro.';
                $estadoFinal = 'caos';
            }

            if ($celda->cantidad_alimento < 20) {
                $detalles[] = 'Dinosaurios hambrientos: comportamiento impredecible.';
            }
        } else {
            $detalles[] = 'Brecha contenida. Los sistemas de seguridad aguantaron.';
        }

        $resultado = [
            'celda'             => [
                'id'      => $celda->id,
                'nombre'  => $celda->nombre,
                'fila'    => $celda->fila,
                'columna' => $celda->columna,
            ],
            'probabilidad_fuga' => $probabilidad,
            'tirada'            => $tirada,
            'fuga_ocurre'       => $fugaOcurre,
            'estado_final'      => $estadoFinal,
            'detalles'          => $detalles,
            'dinosaurios_en_riesgo' => $celda->dinosaurios->where('dieta', 'carnivoro')
                ->map(fn($d) => ['nick' => $d->nick, 'raza' => $d->raza, 'peligrosidad' => $d->nivel_peligrosidad])
                ->values(),
        ];

        $sim = Simulacion::create([
            'tipo'      => 'brecha',
            'user_id'   => $request->user()->id,
            'celda_id'  => $celda->id,
            'resultado' => $resultado,
            'estado'    => $estadoFinal,
        ]);

        return response()->json([
            'simulacion_id' => $sim->id,
            'resultado'     => $resultado,
        ], 200);
    }

    public function historial(): JsonResponse
    {
        $sims = Simulacion::with(['user:id,nick', 'celda:id,nombre'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($sims, 200);
    }
}
