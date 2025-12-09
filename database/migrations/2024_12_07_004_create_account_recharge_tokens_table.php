<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('account_recharge_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('target_amount', 10, 2)->nullable();
            $table->decimal('collected_amount', 10, 2)->default(0);
            $table->string('reason')->nullable();
            $table->enum('status', ['active', 'completed', 'expired', 'cancelled'])->default('active');
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index(['token', 'status']);
            $table->index(['user_id', 'status']);
        });

        // Track contributions to recharge tokens
        Schema::create('recharge_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('token_id')->constrained('account_recharge_tokens')->onDelete('cascade');
            $table->string('donor_name');
            $table->string('donor_phone');
            $table->decimal('amount', 10, 2);
            $table->string('mpesa_receipt')->nullable();
            $table->string('checkout_request_id')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recharge_contributions');
        Schema::dropIfExists('account_recharge_tokens');
    }
};
