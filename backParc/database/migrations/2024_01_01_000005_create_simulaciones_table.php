<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulaciones', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['normal', 'brecha']);
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('celda_id')->nullable()->constrained('celdas')->nullOnDelete();
            $table->json('resultado');
            $table->enum('estado', ['contenida', 'desastre', 'caos'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulaciones');
    }
};
