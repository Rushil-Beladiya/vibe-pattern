<?php

declare(strict_types=1);

namespace App\Enums;

trait InteractWithEnum
{
    /**
     * Find ENUM by name or value
     */
    public static function find(mixed $needle): ?static
    {
        if (in_array($needle, static::names())) {
            return constant("static::$needle");
        }
        if (in_array($needle, static::values())) {
            return static::tryFrom($needle);
        }

        return null;
    }

    /**
     * Get all ENUM names
     */
    public static function names(): array
    {
        return array_column(static::cases(), 'name');
    }

    /**
     * Get all ENUM values
     */
    public static function values(): array
    {
        return array_column(static::cases(), 'value');
    }

    /**
     * Get all ENUM value => name
     */
    public static function array(): array
    {
        return array_combine(static::values(), static::names());
    }

    /**
     * Get all ENUM Array name => value
     */
    public static function enumArray(): array
    {
        return array_combine(static::names(), static::values());
    }

    /**
     * Get ENUM value in string
     */
    public function toString(): string
    {
        return $this->value;
    }
}
