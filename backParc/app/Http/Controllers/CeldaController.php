<?php

namespace App\Http\Controllers;

use App\Events\CeldaUpdated;
use App\Models\Celda;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CeldaController extends Controller
{
    public function index(): JsonResponse
    {
        $celdas = Celda::with([
            'dinosaurios',
            'tareas' => fn($q) => $q->whereIn('estado', ['pendiente', 'en_progreso'])
                                    ->with('user:id,nick,role'),
        ])->get();

        return response()->json($celdas, 200);
    }

    public function show(Celda $celda): JsonResponse
    {
        $celda->load(['dinosaurios', 'tareas.user:id,nick,role']);

        return response()->json($celda, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre'             => 'required|string|max:100',
            'fila'               => 'required|integer|min:0',
            'columna'            => 'required|integer|min:0',
            'nivel_seguridad'    => 'required|integer|min:1|max:10',
            'cantidad_alimento'  => 'numeric|min:0|max:100',
            'averias_pendientes' => 'integer|min:0',
            'estado'             => 'in:operativa,mantenimiento,brecha,evacuada',
            'notas'              => 'nullable|string',
        ], [
            'nombre.required'          => 'El nombre es obligatorio.',
            'nivel_seguridad.required' => 'El nivel de seguridad es obligatorio.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $existe = Celda::where('fila', $request->fila)
                       ->where('columna', $request->columna)
                       ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya existe una celda en esa posición del grid.'], 409);
        }

        $celda = Celda::create($request->all());
        broadcast(new CeldaUpdated($celda->fresh(), 'created'));

        return response()->json($celda, 201);
    }

    public function update(Request $request, Celda $celda): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre'             => 'sometimes|string|max:100',
            'nivel_seguridad'    => 'sometimes|integer|min:1|max:10',
            'cantidad_alimento'  => 'sometimes|numeric|min:0|max:100',
            'averias_pendientes' => 'sometimes|integer|min:0',
            'estado'             => 'sometimes|in:operativa,mantenimiento,brecha,evacuada',
            'notas'              => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $celda->update($request->all());
        broadcast(new CeldaUpdated($celda->fresh(), 'updated'));

        return response()->json($celda, 200);
    }

    public function destroy(Celda $celda): JsonResponse
    {
        $celdaSnapshot = $celda->replicate();
        $celdaSnapshot->id = $celda->id;
        $celda->delete();
        broadcast(new CeldaUpdated($celdaSnapshot, 'deleted'));

        return response()->json(['message' => 'Celda eliminada correctamente.'], 200);
    }
}
