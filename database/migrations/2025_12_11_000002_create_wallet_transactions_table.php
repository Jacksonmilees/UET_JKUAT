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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Transaction type: credit (add to wallet) or debit (spend from wallet)
            $table->enum('type', ['credit', 'debit']);

            // Amount of the transaction
            $table->decimal('amount', 15, 2);

            // Balance after this transaction
            $table->decimal('balance_after', 15, 2);

            // For credits: source of funds (recharge, settlement, refund, etc.)
            $table->string('source')->nullable();

            // For debits: purpose of payment (project, merchandise, withdrawal, etc.)
            $table->string('purpose')->nullable();

            // Reference to related entities (project_id, product_id, etc.)
            $table->string('reference_type')->nullable(); // e.g., 'App\Models\Project'
            $table->unsignedBigInteger('reference_id')->nullable();

            // Additional metadata
            $table->json('metadata')->nullable();

            // Status of transaction
            $table->enum('status', ['completed', 'pending', 'failed', 'reversed'])->default('completed');

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
