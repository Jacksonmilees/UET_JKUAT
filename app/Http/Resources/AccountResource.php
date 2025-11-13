<?php

// app/Http/Resources/AccountResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'account_type_id' => $this->account_type_id ?? 0,
            'account_subtype_id' => $this->account_subtype_id ?? null,
            'name' => $this->name ?? '',
            'account_number' => $this->account_number ?? '',
            'reference' => $this->reference ?? '',
            'type' => $this->type ?? 'standard',
            'balance' => (float) ($this->balance ?? 0.00),
            'parent_id' => $this->parent_id ?? null,
            'status' => $this->status ?? 'active',
            'metadata' => $this->metadata ?? [],
            'account_type' => new AccountTypeResource($this->whenLoaded('accountType')),
            'account_subtype' => $this->whenLoaded('accountSubtype') ? 
                new AccountSubtypeResource($this->accountSubtype) : null,
            'parent' => $this->whenLoaded('parent') ? 
                new AccountResource($this->parent) : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString()
        ];
    }
}