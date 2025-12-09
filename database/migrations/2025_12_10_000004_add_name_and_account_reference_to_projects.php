<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'name')) {
                $table->string('name')->nullable()->after('id');
            }
            if (!Schema::hasColumn('projects', 'account_reference')) {
                $table->string('account_reference')->nullable()->after('account_number');
            }
            if (!Schema::hasColumn('projects', 'status')) {
                $table->string('status')->default('active')->after('current_amount');
            }
        });
        
        // Copy title to name if name is null
        DB::statement('UPDATE projects SET name = title WHERE name IS NULL');
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'name')) {
                $table->dropColumn('name');
            }
            if (Schema::hasColumn('projects', 'account_reference')) {
                $table->dropColumn('account_reference');
            }
        });
    }
};
