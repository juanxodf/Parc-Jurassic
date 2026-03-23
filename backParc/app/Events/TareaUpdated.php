<?php

namespace App\Events;

use App\Models\Tarea;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TareaUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Tarea $tarea, public string $action = 'updated')
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel('tareas')];
    }

    public function broadcastAs(): string
    {
        return 'tarea.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->tarea->id,
            'action' => $this->action,
            'celda_id' => $this->tarea->celda_id,
            'estado' => $this->tarea->estado,
        ];
    }
}
