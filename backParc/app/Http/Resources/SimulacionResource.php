<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SimulacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'estado' => $this->estado,
            'resultado' => $this->resultado,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user?->id,
                    'nick' => $this->user?->nick,
                ];
            }),
            'celda' => $this->whenLoaded('celda', function () {
                return [
                    'id' => $this->celda?->id,
                    'nombre' => $this->celda?->nombre,
                ];
            }),
        ];
    }
}
