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
        Schema::table('withdrawals', function (Blueprint $table) {
            if (!Schema::hasColumn('withdrawals', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending')->after('status')->index();
            }
            if (!Schema::hasColumn('withdrawals', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('approval_status')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('withdrawals', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('withdrawals', 'requires_approval')) {
                $table->boolean('requires_approval')->default(true)->after('approved_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $columns = ['approval_status', 'approved_by', 'approved_at', 'requires_approval'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('withdrawals', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
