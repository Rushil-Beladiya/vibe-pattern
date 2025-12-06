<?php

declare(strict_types=1);

if (! function_exists('formatValidationErrors')) {
    /**
     * Format a given errors array with key value pair.
     */
    function formatValidationErrors(array $errors): array
    {
        return collect($errors)
            ->mapWithKeys(function ($messages, $field) {
                $parts = explode('.', $field);
                $simpleField = end($parts);

                return [$simpleField => $messages[0]];
            })
            ->toArray();
    }
}
