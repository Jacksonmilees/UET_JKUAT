<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts');
            $table->foreignId('transaction_id')->nullable()->constrained('transactions');
            $table->foreignId('initiated_by')->nullable()->constrained('users');
            $table->decimal('amount', 10, 2);
            $table->string('phone_number');
            $table->string('withdrawal_reason');
            $table->string('remarks')->nullable();
            $table->string('status')->default('initiated'); // initiated, pending, completed, failed, timeout
            $table->string('mpesa_conversation_id')->nullable();
            $table->string('mpesa_transaction_id')->nullable();
            $table->string('mpesa_result_code')->nullable();
            $table->string('mpesa_result_desc')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index('mpesa_conversation_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('withdrawals');
    }
};
