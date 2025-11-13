<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountType extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function subtypes()
    {
        return $this->hasMany(AccountSubtype::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
}