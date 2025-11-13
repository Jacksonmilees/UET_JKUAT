<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMpesaTransactionLogsTable extends Migration
{
    public function up()
    {
        Schema::create('mpesa_transaction_logs', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mpesa_transaction_logs');
    }
}