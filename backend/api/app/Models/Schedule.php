<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'time', 'title', 'location', 'assignee', 'status', 'duration',
    ];

    const UPDATED_AT = null;

    public function toApi(): array
    {
        return [
            'id' => $this->id,
            'time' => $this->time,
            'title' => $this->title,
            'location' => $this->location,
            'assignee' => $this->assignee,
            'status' => $this->status,
            'duration' => $this->duration,
        ];
    }
}
