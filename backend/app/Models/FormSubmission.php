<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class FormSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'submitted_by',
        'submitted_data',
        'submission_number',
    ];

    protected $casts = [
        'submitted_data' => 'array',
    ];

    /**
     * Get submitted data as array
     */
    public function getSubmittedDataAsArray(): array
    {
        $data = $this->submitted_data;

        if (is_string($data)) {
            return json_decode($data, true) ?? [];
        }

        return is_array($data) ? $data : [];
    }

    /**
     * Relationship: Form
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Relationship: Submitted By User
     */
    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Scope: Filter by user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('submitted_by', $userId);
    }

    /**
     * Scope: Filter by form
     */
    public function scopeForForm($query, int $formId)
    {
        return $query->where('form_id', $formId);
    }

    /**
     * Scope: Within date range
     */
    public function scopeWithinDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope: Recent submissions
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: With relationships
     */
    public function scopeWithDetails($query)
    {
        return $query->with(['form:id,name,screen_id', 'submittedBy:id,name,email']);
    }

    /**
     * Generate submission number
     */
    public static function generateSubmissionNumber(): string
    {
        $date = now()->format('Ymd');
        $count = self::whereDate('created_at', now()->toDateString())->count() + 1;
        return 'SUB-' . $date . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get submission count for form and user
     */
    public static function getSubmissionCount(int $formId, int $userId): int
    {
        return self::where('form_id', $formId)
            ->where('submitted_by', $userId)
            ->count();
    }

    /**
     * Get latest submission
     */
    public static function getLatestSubmission(int $formId, int $userId)
    {
        return self::where('form_id', $formId)
            ->where('submitted_by', $userId)
            ->latest('created_at')
            ->first();
    }
}


