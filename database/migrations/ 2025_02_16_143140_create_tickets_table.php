<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTicketsTable extends Migration
{
    public function up()
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('member_mmid');
            $table->string('ticket_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('phone_number');
            $table->string('buyer_name');
            $table->string('buyer_contact');
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->string('mpesa_receipt_number')->nullable();
            $table->timestamps();

            // Add foreign key constraint
            $table->foreign('member_mmid')->references('MMID')->on('moutsystem.members')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tickets');
    }
}
