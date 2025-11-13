<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
// app/Http/Resources/TransactionResource.php
class TransactionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'type' => $this->type,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'reference' => $this->reference,
            'phone_number' => $this->phone_number,
            'payer_name' => $this->payer_name,
            'metadata' => $this->metadata,
            'processed_at' => $this->processed_at,
            'created_at' => $this->created_at,
        ];
    }
}