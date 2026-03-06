<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dinosaurios', function (Blueprint $table) {
            $table->id();
            $table->string('nick')->unique();
            $table->string('raza');
            $table->enum('dieta', ['herbivoro', 'omnivoro', 'carnivoro']);
            $table->enum('nivel_peligrosidad', ['bajo', 'medio', 'alto', 'muy_alto', 'extremo', 'critico']);
            $table->integer('edad');
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['sano', 'herido', 'enfermo', 'muerto'])->default('sano');
            $table->foreignId('celda_id')->nullable()->constrained('celdas')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dinosaurios');
    }
};
