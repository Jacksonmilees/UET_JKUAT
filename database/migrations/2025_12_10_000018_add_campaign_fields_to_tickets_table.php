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
        Schema::table('tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('tickets', 'project_id')) {
                $table->foreignId('project_id')->nullable()->after('ticket_number')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('tickets', 'campaign_id')) {
                $table->foreignId('campaign_id')->nullable()->after('project_id')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('tickets', 'qr_code')) {
                $table->text('qr_code')->nullable()->after('amount');
            }
            if (!Schema::hasColumn('tickets', 'used_at')) {
                $table->timestamp('used_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('tickets', 'metadata')) {
                $table->json('metadata')->nullable()->after('used_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $columns = ['project_id', 'campaign_id', 'qr_code', 'used_at', 'metadata'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('tickets', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
