<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained();
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 15, 2);
            $table->string('type'); // credit/debit
            $table->string('payment_method');
            $table->string('status');
            $table->string('reference');
            $table->string('phone_number')->nullable();
            $table->string('payer_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}