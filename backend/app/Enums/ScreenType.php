<?php
namespace App\Enums;

use App\Enums\InteractWithEnum;

enum ScreenType: string
{

    use InteractWithEnum;

    case Home = "home";
    case Vibro = "vibro";
    case Profile = "profile";
}
?>