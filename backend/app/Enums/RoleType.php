<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleType: string
{
    use InteractWithEnum;
    case SuperAdmin = '1';
    case Admin = '2';
    case User = '3';
}
