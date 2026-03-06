<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('parque', function ($user) {
    return $user !== null;
});
