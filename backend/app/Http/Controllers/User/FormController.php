<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;

class FormController extends Controller
{
    /**
     * Display the specified form with field values
     */
    public function show(Form $form)
    {
        $form->load('screen');

        return response()->json([
            'success' => true,
            'data' => $form
        ]);
    }
}
