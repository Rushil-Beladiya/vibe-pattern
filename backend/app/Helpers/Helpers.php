<?php


if (!function_exists('formatValidationErrors')) {
    /**
     * Format a given errors array with key value pair.
     *
     * @param array $errors
     * @return array
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