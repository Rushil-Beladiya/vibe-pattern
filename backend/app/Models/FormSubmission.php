<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class FormSubmission extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'form_id',
        'submitted_by',
        'submitted_data',
        'submission_number',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'submitted_data' => 'array',
    ];

    /**
     * Get the form that this submission belongs to.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Get the user who submitted the form.
     */
    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Generate a unique submission number.
     */
    public static function generateSubmissionNumber(): string
    {
        $date = now()->format('Ymd');
        $count = self::whereDate('created_at', now()->toDateString())->count() + 1;
        return 'SUB-' . $date . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT);
    }
}
