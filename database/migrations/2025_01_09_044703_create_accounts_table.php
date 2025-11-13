<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/2024_01_09_000003_create_accounts_table.php
class CreateAccountsTable extends Migration
{
    public function up()
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_type_id')->constrained();
            $table->foreignId('account_subtype_id')->nullable()->constrained();
            $table->string('name');
            $table->string('account_number')->unique();
            $table->decimal('balance', 15, 2)->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('accounts');
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('accounts');
    }
}
