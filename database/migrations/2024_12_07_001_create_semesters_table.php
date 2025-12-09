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
        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Semester 1 2024/2025"
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('mandatory_amount', 10, 2)->default(100.00);
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('settings')->nullable(); // Additional semester settings
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Add semester tracking to users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_semester_id')->nullable()->constrained('semesters')->nullOnDelete();
            $table->boolean('mandatory_paid_current_semester')->default(false);
            $table->timestamp('mandatory_paid_at')->nullable();
        });

        // Add semester tracking to transactions
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('semester_id')->nullable()->constrained('semesters')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn('semester_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_semester_id']);
            $table->dropColumn(['current_semester_id', 'mandatory_paid_current_semester', 'mandatory_paid_at']);
        });

        Schema::dropIfExists('semesters');
    }
};
