<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('celda_id')->constrained('celdas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('tipo', ['veterinario', 'mantenimiento']);
            $table->enum('estado', ['pendiente', 'en_progreso', 'finalizada'])->default('pendiente');
            $table->text('descripcion')->nullable();
            $table->timestamp('iniciada_en')->nullable();
            $table->timestamp('finalizada_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tareas');
    }
};
