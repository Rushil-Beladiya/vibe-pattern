<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Form;

final class FormController  
{
    /**
     * Display the specified form with field values
     */
    public function show(Form $form)
    {
        $form->load('screen');

        return response()->json([
            'success' => true,
            'data' => $form,
        ]);
    }
}
