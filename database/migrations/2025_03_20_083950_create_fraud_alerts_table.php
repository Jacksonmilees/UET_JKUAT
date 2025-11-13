<?php
// database/migrations/2024_01_01_000001_create_fraud_alerts_table.php
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
        Schema::create('fraud_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->string('risk_level')->index(); // low, medium, high, critical
            $table->decimal('risk_score', 5, 4)->index(); // 0.0000 to 1.0000
            $table->decimal('anomaly_score', 5, 4)->default(0); // 0.0000 to 1.0000
            $table->json('fraud_flags')->nullable(); // Array of fraud indicators
            $table->json('anomaly_types')->nullable(); // Array of anomaly types
            $table->json('recommendations')->nullable(); // AI recommendations
            $table->string('status')->default('pending_review')->index(); // pending_review, reviewed, false_positive, confirmed_fraud
            $table->text('reviewer_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->json('metadata')->nullable(); // Additional AI analysis data
            $table->timestamps();

            $table->index(['risk_level', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fraud_alerts');
    }
};