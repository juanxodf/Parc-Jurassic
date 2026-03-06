<?php

namespace App\Http\Controllers;

use App\Models\Dinosaurio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DinosaurioController extends Controller
{
    public function index(): JsonResponse
    {
        $dinos = Dinosaurio::with('celda:id,nombre,fila,columna')->get();

        return response()->json($dinos, 200);
    }

    public function show(Dinosaurio $dinosaurio): JsonResponse
    {
        $dinosaurio->load('celda');

        return response()->json($dinosaurio, 200);
    }

    public function razas(): JsonResponse
    {
        return response()->json(Dinosaurio::RAZAS, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $razas = implode(',', array_keys(Dinosaurio::RAZAS));

        $validator = Validator::make($request->all(), [
            'nick'     => 'required|string|unique:dinosaurios',
            'raza'     => "required|in:{$razas}",
            'edad'     => 'required|integer|min:0',
            'descripcion' => 'nullable|string',
            'estado'   => 'in:sano,herido,enfermo,muerto',
            'celda_id' => 'nullable|exists:celdas,id',
        ], [
            'nick.unique' => 'El nick ya está en uso.',
            'raza.in'     => 'Raza no válida.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $defaults = Dinosaurio::RAZAS[$request->raza];

        $dino = Dinosaurio::create([
            'nick'               => $request->nick,
            'raza'               => $request->raza,
            'edad'               => $request->edad,
            'descripcion'        => $request->descripcion,
            'estado'             => $request->input('estado', 'sano'),
            'celda_id'           => $request->celda_id,
            'dieta'              => $defaults['dieta'],
            'nivel_peligrosidad' => $defaults['nivel_peligrosidad'],
        ]);

        return response()->json($dino->load('celda'), 201);
    }

    public function update(Request $request, Dinosaurio $dinosaurio): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nick'        => 'sometimes|string|unique:dinosaurios,nick,' . $dinosaurio->id,
            'edad'        => 'sometimes|integer|min:0',
            'descripcion' => 'nullable|string',
            'estado'      => 'sometimes|in:sano,herido,enfermo,muerto',
            'celda_id'    => 'nullable|exists:celdas,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $dinosaurio->update($request->only(['nick', 'edad', 'descripcion', 'estado', 'celda_id']));

        return response()->json($dinosaurio->load('celda'), 200);
    }

    public function destroy(Dinosaurio $dinosaurio): JsonResponse
    {
        $dinosaurio->delete();

        return response()->json(['message' => 'Dinosaurio eliminado correctamente.'], 200);
    }
}
