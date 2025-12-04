<?php

namespace App\Enums;

trait InteractWithEnum
{
    /**
     * Find ENUM by name or value
     *
     * @param mixed $needle
     *
     * @return static|null
     */
    public static function find(mixed $needle): static|null
    {
        if (in_array($needle, static::names()))
            return constant("static::$needle");
        if (in_array($needle, static::values()))
            return static::tryFrom($needle);

        return null;
    }

    /**
     * Get all ENUM names
     *
     * @return array
     */
    public static function names(): array
    {
        return array_column(static::cases(), 'name');
    }

    /**
     * Get all ENUM values
     *
     * @return array
     */
    public static function values(): array
    {
        return array_column(static::cases(), 'value');
    }

    /**
     * Get all ENUM value => name
     *
     * @return array
     */
    public static function array(): array
    {
        return array_combine(static::values(), static::names());
    }

    /**
     * Get all ENUM Array name => value
     *
     * @return array
     */
    public static function enumArray(): array
    {
        return array_combine(static::names(), static::values());
    }

    /**
     * Get ENUM value in string
     * 
     * @return string
     */
    public function toString(): string
    {
        return $this->value;
    }
}