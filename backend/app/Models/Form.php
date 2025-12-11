<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class Form extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'screen_id',
        'name',
        'fields',
        'is_active',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fields' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the screen that owns the form.
     */
    public function screen()
    {
        return $this->belongsTo(Screen::class);
    }

    /**
     * Get the user who created the form.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all submissions for this form.
     */
    public function submissions()
    {
        return $this->hasMany(FormSubmission::class);
    }

    /**
     * Scope a query to only include active forms.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Initialize empty values for all fields
     */
    public function initializeFieldValues()
    {
        $fields = $this->fields;
        foreach ($fields as &$field) {
            if (! isset($field['value'])) {
                $field['value'] = '';
            }
        }
        $this->fields = $fields;

        return $this;
    }

    /**
     * Update field values from request data
     */
    public function updateFieldValues(array $data, array $files = [])
    {
        $fields = $this->fields;

        foreach ($fields as &$field) {
            $key = $field['key'];

            // Handle file/image uploads
            if (in_array($field['type'], ['file', 'image']) && isset($files[$key])) {
                $field['value'] = $files[$key];
            }
            // Handle regular inputs
            elseif (isset($data[$key])) {
                $field['value'] = $data[$key];
            }
        }

        $this->fields = $fields;

        return $this;
    }
}
