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
        Schema::create('campaign_donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->string('donor_name');
            $table->string('donor_email')->nullable();
            $table->string('donor_phone');
            $table->decimal('amount', 12, 2);
            $table->boolean('is_anonymous')->default(false);
            $table->text('message')->nullable();
            $table->enum('source', ['link', 'qr', 'direct', 'social'])->default('link');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('mpesa_receipt')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('campaign_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_donations');
    }
};
