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
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('projects', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('projects', 'slug')) {
                $table->string('slug')->nullable()->after('name')->unique();
            }
            if (!Schema::hasColumn('projects', 'featured_image')) {
                $table->string('featured_image')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('projects', 'visibility')) {
                $table->enum('visibility', ['public', 'private', 'members_only'])->default('public')->after('status');
            }
            if (!Schema::hasColumn('projects', 'allow_donations')) {
                $table->boolean('allow_donations')->default(true)->after('visibility');
            }
            if (!Schema::hasColumn('projects', 'metadata')) {
                $table->json('metadata')->nullable()->after('allow_donations');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $columns = ['user_id', 'category_id', 'slug', 'featured_image', 'visibility', 'allow_donations', 'metadata'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('projects', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
