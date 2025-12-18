<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class Form extends Model
{
    use HasFactory;

    protected $fillable = [
        'screen_id',
        'name',
        'fields',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'fields' => 'array',
        'is_active' => 'boolean',
    ];

    public function getFieldsAsArray(): array
    {
        $fields = $this->fields;

        if (is_string($fields)) {
            return json_decode($fields, true) ?? [];
        }

        return is_array($fields) ? $fields : [];
    }

    public function screen()
    {
        return $this->belongsTo(Screen::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions()
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForScreen($query, int $screenId)
    {
        return $query->where('screen_id', $screenId);
    }

    public function scopeCreatedBy($query, int $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeWithDetails($query)
    {
        return $query->with(['screen:id,name,slug', 'creator:id,name,email']);
    }

    public function scopeWithSubmissionCount($query)
    {
        return $query->withCount('submissions');
    }
}
