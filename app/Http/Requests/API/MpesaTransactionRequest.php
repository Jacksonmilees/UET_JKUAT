<?php

namespace App\Http\Requests\API;

use Illuminate\Foundation\Http\FormRequest;

class MpesaTransactionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'TransID' => 'required|string',
            'TransAmount' => 'required|numeric',
            'BillRefNumber' => 'required|string',
            'MSISDN' => 'required|string',
            'FirstName' => 'required|string',
            'MiddleName' => 'nullable|string',
            'LastName' => 'nullable|string',
        ];
    }
}