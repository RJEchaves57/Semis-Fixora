<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    protected $fillable = [
        'name', 'details', 'condition', 'condition_percent', 'open_issues',
    ];

    const UPDATED_AT = null;

    protected $casts = [
        'condition_percent' => 'integer',
        'open_issues' => 'integer',
    ];

    public function toApi(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'details' => $this->details,
            'condition' => $this->condition,
            'condition_percent' => $this->condition_percent,
            'open_issues' => $this->open_issues,
        ];
    }
}
