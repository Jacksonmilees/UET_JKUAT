<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add published_at column to news table if missing
     */
    public function up(): void
    {
        if (Schema::hasTable('news') && !Schema::hasColumn('news', 'published_at')) {
            Schema::table('news', function (Blueprint $table) {
                $table->timestamp('published_at')->nullable()->after('published');
            });
        }
    }

    /**
     * Remove published_at column from news table
     */
    public function down(): void
    {
        if (Schema::hasTable('news') && Schema::hasColumn('news', 'published_at')) {
            Schema::table('news', function (Blueprint $table) {
                $table->dropColumn('published_at');
            });
        }
    }
};
