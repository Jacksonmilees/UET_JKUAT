<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountSubtype extends Model
{
    protected $fillable = ['account_type_id', 'name', 'code', 'description'];

    public function accountType()
    {
        return $this->belongsTo(AccountType::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
}
