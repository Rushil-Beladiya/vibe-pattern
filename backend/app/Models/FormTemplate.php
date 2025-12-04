<?php

namespace App\Models;

use App\Enums\ScreenType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class FormTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'screen',
        'name',
        'fields',
        'created_by',
    ];

    protected $casts = [
        'fields' => 'array',
        'screen' => ScreenType::class,
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($template) {
            if (! empty($template->fields)) {
                $fields = collect($template->fields)->map(function ($field) {
                    if (isset($field['key']) && (! isset($field['label']) || empty($field['label']))) {
                        $field['label'] = Str::headline($field['key']);
                    }

                    return $field;
                })->toArray();

                $template->fields = $fields;
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class, 'form_template_id');
    }
}
