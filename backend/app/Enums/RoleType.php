<?php
namespace App\Enums;

use App\Enums\InteractWithEnum;

enum RoleType: string
{

    use InteractWithEnum;
    case SuperAdmin = "1";
    case Admin = "2";
    case User = "3";
}
?>