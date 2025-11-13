<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateAccountsTableFixUniqueConstraints extends Migration
{
    public function up()
    {
        Schema::table('accounts', function (Blueprint $table) {
            // Drop the existing unique constraint if it exists
            $table->dropUnique(['account_number']);
            
            // Add a new unique constraint on both reference and account_number
            $table->unique(['reference', 'account_number'], 'accounts_reference_account_number_unique');
        });
    }

    public function down()
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropUnique('accounts_reference_account_number_unique');
            $table->unique(['account_number']);
        });
    }
}