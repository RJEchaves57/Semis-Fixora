<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RequestMedia extends Model
{
    protected $table = 'request_media';

    protected $fillable = ['maintenance_request_id', 'type', 'path', 'original_name'];

    public function toApi(): array
    {
        return [
            'name' => $this->original_name,
            'url' => Storage::disk('public')->url($this->path),
        ];
    }
}
