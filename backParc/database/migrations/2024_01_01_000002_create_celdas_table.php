<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('celdas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->integer('fila');
            $table->integer('columna');
            $table->integer('nivel_seguridad')->default(5);
            $table->decimal('cantidad_alimento', 5, 2)->default(100.00);
            $table->integer('averias_pendientes')->default(0);
            $table->enum('estado', ['operativa', 'mantenimiento', 'brecha', 'evacuada'])->default('operativa');
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->unique(['fila', 'columna']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('celdas');
    }
};
