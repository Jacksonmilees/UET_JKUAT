<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            // Add new columns
            if (!Schema::hasColumn('withdrawals', 'reference')) {
                $table->string('reference')->unique()->nullable()->after('status');
            }

            if (!Schema::hasColumn('withdrawals', 'initiated_by')) {
                $table->string('initiated_by')->nullable()->after('updated_at');
            }

            // Ensure amount is decimal with proper precision
            $table->decimal('amount', 15, 2)->change();

            // Foreign key constraint already exists from create_withdrawals migration
            // Skipping to avoid duplicate constraint error
        });

        // Populate new columns with default values for existing records
        // PostgreSQL uses gen_random_uuid() instead of UUID()
        DB::statement("UPDATE withdrawals SET reference = CONCAT('WD-', gen_random_uuid()::text) WHERE reference IS NULL");
        
        // If initiated_by_name contains useful data, you might want to copy it to initiated_by
        // Note: initiated_by_name column may not exist, so skip this for now
        // DB::statement("UPDATE withdrawals SET initiated_by = initiated_by_name WHERE initiated_by IS NULL AND initiated_by_name IS NOT NULL");
    }

    public function down()
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            // Drop foreign key if it was added
            try {
                $table->dropForeign(['account_id']);
            } catch (\Exception $e) {
                \Log::info('Could not drop foreign key on account_id: ' . $e->getMessage());
            }

            // Drop new columns
            if (Schema::hasColumn('withdrawals', 'reference')) {
                $table->dropColumn('reference');
            }
            if (Schema::hasColumn('withdrawals', 'initiated_by')) {
                $table->dropColumn('initiated_by');
            }
        });
    }
};