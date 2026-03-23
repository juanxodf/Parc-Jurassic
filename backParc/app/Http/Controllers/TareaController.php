<?php

namespace App\Http\Controllers;

use App\Events\TareaUpdated;
use App\Models\Tarea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TareaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Tarea::with(['celda:id,nombre,fila,columna', 'user:id,nick,role']);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get(), 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'celda_id'    => 'required|exists:celdas,id',
            'user_id'     => 'required|exists:users,id',
            'tipo'        => 'required|in:veterinario,mantenimiento',
            'descripcion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $tarea = Tarea::create([
            'celda_id'    => $request->celda_id,
            'user_id'     => $request->user_id,
            'tipo'        => $request->tipo,
            'descripcion' => $request->descripcion,
            'estado'      => 'pendiente',
        ]);

        $tarea->load(['celda:id,nombre', 'user:id,nick']);
        broadcast(new TareaUpdated($tarea, 'created'));

        return response()->json($tarea, 201);
    }

    public function iniciar(Request $request, Tarea $tarea): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $tarea->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($tarea->estado !== 'pendiente') {
            return response()->json(['message' => 'La tarea no está en estado pendiente.'], 409);
        }

        $tarea->iniciar();
        broadcast(new TareaUpdated($tarea->fresh(), 'started'));

        return response()->json($tarea, 200);
    }

    public function finalizar(Request $request, Tarea $tarea): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $tarea->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($tarea->estado !== 'en_progreso') {
            return response()->json(['message' => 'La tarea no está en progreso.'], 409);
        }

        $tarea->finalizar();
        broadcast(new TareaUpdated($tarea->fresh(), 'finished'));

        return response()->json($tarea, 200);
    }

    public function destroy(Tarea $tarea): JsonResponse
    {
        $tareaSnapshot = $tarea->replicate();
        $tareaSnapshot->id = $tarea->id;
        $tarea->delete();
        broadcast(new TareaUpdated($tareaSnapshot, 'deleted'));

        return response()->json(['message' => 'Tarea eliminada correctamente.'], 200);
    }
}
