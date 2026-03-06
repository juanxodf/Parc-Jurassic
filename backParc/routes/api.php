<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\CeldaController;
use App\Http\Controllers\DinosaurioController;
use App\Http\Controllers\SimulacionController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ── Públicas ──────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Autenticadas ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/me',               [AuthController::class, 'me']);
    Route::patch('/me',             [AuthController::class, 'updateProfile']);

    Route::get('/celdas',           [CeldaController::class, 'index']);
    Route::get('/celdas/{celda}',   [CeldaController::class, 'show']);

    Route::get('/dinosaurios',          [DinosaurioController::class, 'index']);
    Route::get('/dinosaurios/razas',    [DinosaurioController::class, 'razas']);
    Route::get('/dinosaurios/{dinosaurio}', [DinosaurioController::class, 'show']);

    Route::get('/tareas',               [TareaController::class, 'index']);
    Route::patch('/tareas/{tarea}/iniciar',   [TareaController::class, 'iniciar']);
    Route::patch('/tareas/{tarea}/finalizar', [TareaController::class, 'finalizar']);

    // ── Solo admin ────────────────────────────────────────────────────
    Route::middleware('abilities:admin')->group(function () {

        Route::post('/celdas',          [CeldaController::class, 'store']);
        Route::put('/celdas/{celda}',   [CeldaController::class, 'update']);
        Route::delete('/celdas/{celda}',[CeldaController::class, 'destroy']);

        Route::post('/dinosaurios',             [DinosaurioController::class, 'store']);
        Route::put('/dinosaurios/{dinosaurio}', [DinosaurioController::class, 'update']);
        Route::delete('/dinosaurios/{dinosaurio}', [DinosaurioController::class, 'destroy']);

        Route::apiResource('usuarios', UserController::class);

        Route::post('/tareas',          [TareaController::class, 'store']);
        Route::delete('/tareas/{tarea}',[TareaController::class, 'destroy']);

        Route::post('/simulaciones/normal', [SimulacionController::class, 'normal']);
        Route::post('/simulaciones/brecha', [SimulacionController::class, 'brecha']);
        Route::get('/simulaciones',         [SimulacionController::class, 'historial']);
    });
});
