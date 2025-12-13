<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add published_at column to news table if missing (guaranteed first)
     */
    public function up(): void
    {
        if (Schema::hasTable('news')) {
            $columns = Schema::getColumnListing('news');
            if (!in_array('published_at', $columns)) {
                \DB::statement("ALTER TABLE news ADD COLUMN published_at TIMESTAMP NULL");
            }
        }
    }

    /**
     * Remove published_at column from news table
     */
    public function down(): void
    {
        if (Schema::hasTable('news')) {
            $columns = Schema::getColumnListing('news');
            if (in_array('published_at', $columns)) {
                \DB::statement("ALTER TABLE news DROP COLUMN published_at");
            }
        }
    }
};
