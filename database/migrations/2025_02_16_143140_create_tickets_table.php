<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTicketsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('tickets')) {
            Schema::create('tickets', function (Blueprint $table) {
                $table->id();
                $table->string('member_mmid')->nullable();
                $table->string('ticket_number')->unique();
                $table->decimal('amount', 10, 2);
                $table->string('phone_number');
                $table->string('buyer_name');
                $table->string('buyer_contact');
                $table->string('status')->default('pending'); // pending, completed, failed
                $table->string('mpesa_receipt_number')->nullable();
                $table->timestamps();

                // Foreign key constraint removed - members table structure unclear
                // Can be added later if needed
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('tickets');
    }
}
