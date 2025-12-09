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
        Schema::table('users', function (Blueprint $table) {
            // Custom permissions override for user
            $table->json('permissions')->nullable()->after('role');
            // Who assigned the role
            $table->foreignId('role_assigned_by')->nullable()->after('permissions')->constrained('users')->nullOnDelete();
            // When role was assigned
            $table->timestamp('role_assigned_at')->nullable()->after('role_assigned_by');
            // User region/location for grouping
            $table->string('region')->nullable()->after('residence');
            // Year/class group
            $table->string('class_group')->nullable()->after('region');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_assigned_by']);
            $table->dropColumn(['permissions', 'role_assigned_by', 'role_assigned_at', 'region', 'class_group']);
        });
    }
};
