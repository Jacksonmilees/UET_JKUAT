<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AccountSubtypeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'account_type_id' => $this->account_type_id,
            'code' => $this->code ?? '',
            'name' => $this->name ?? '',
            'description' => $this->description ?? '',
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString()
        ];
    }
}