<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MaintenanceRequest extends Model
{
    public const CATEGORIES = [
        'Electrical', 'Plumbing', 'Carpentry', 'IT Equipment', 'Furniture',
        'HVAC', 'Cleaning', 'Building & Safety', 'Other',
    ];

    public const PRIORITIES = ['Low', 'Medium', 'High'];

    public const OPEN_STATUSES = ['Pending', 'Approved', 'Assigned', 'In Progress'];

    protected $fillable = [
        'code', 'title', 'description', 'category', 'location', 'priority', 'status',
        'requester_id', 'assignee_id', 'decline_reason', 'fingerprint', 'open_fingerprint',
    ];

    /**
     * Use the request code (e.g. FX-2049) for Laravel route model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'code';
    }

    /**
     * Generate a fingerprint for duplicate request detection.
     */
    public static function fingerprint(string $category, string $location, string $title): string
    {
        $norm = fn (string $s) => trim(preg_replace('/[^\p{L}\p{N}]+/u', ' ', Str::lower($s)));

        return hash('sha256', $norm($category).'|'.$norm($location).'|'.$norm($title));
    }

    protected static function booted(): void
    {
        static::saving(function (self $r) {
            $r->open_fingerprint = in_array($r->status, self::OPEN_STATUSES, true)
                ? $r->fingerprint
                : null;
        });
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(RequestMedia::class);
    }

    public function toApi(): array
    {
        $media = $this->media;
        $video = $media->firstWhere('type', 'video');

        return [
            'id' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'location' => $this->location,
            'requesterId' => (string) $this->requester_id,
            'requester' => $this->requester?->name ?? 'Unknown',
            'date' => $this->created_at->format('M j, Y'),
            'priority' => $this->priority,
            'status' => $this->status,
            'assigneeId' => $this->assignee_id ? (string) $this->assignee_id : null,
            'assignee' => $this->assignee?->name ?? 'Unassigned',
            'images' => $media->where('type', 'image')->map->toApi()->values(),
            'video' => $video?->toApi(),
            'declineReason' => $this->decline_reason,
        ];
    }
}
