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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
            $table->string('unique_code')->unique(); // e.g., UET-FUND-ABC123
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('target_amount', 12, 2)->nullable();
            $table->decimal('current_amount', 12, 2)->default(0);
            $table->string('image_url')->nullable();
            $table->string('slug')->unique();
            $table->enum('status', ['active', 'paused', 'completed', 'archived'])->default('active');
            $table->enum('campaign_type', ['project', 'ticket', 'general'])->default('general');
            $table->dateTime('end_date')->nullable();
            $table->json('settings')->nullable(); // allow_anonymous, show_donors, etc.
            $table->json('analytics_data')->nullable(); // views, shares, conversion_rate
            $table->integer('views_count')->default(0);
            $table->integer('shares_count')->default(0);
            $table->integer('donations_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('unique_code');
            $table->index('slug');
            $table->index('status');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
