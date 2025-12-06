<?php

declare(strict_types=1);

namespace App\Enums;

enum ScreenType: string
{
    use InteractWithEnum;

    case Home = 'home';
    case Vibro = 'vibro';
    case Profile = 'profile';
}
