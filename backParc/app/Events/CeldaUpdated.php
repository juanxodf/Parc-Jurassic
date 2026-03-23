<?php

namespace App\Events;

use App\Models\Celda;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CeldaUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Celda $celda, public string $action = 'updated')
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel('celdas')];
    }

    public function broadcastAs(): string
    {
        return 'celda.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->celda->id,
            'action' => $this->action,
        ];
    }
}
