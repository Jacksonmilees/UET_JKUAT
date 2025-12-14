<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add category column to news table if missing (raw SQL fallback)
     */
    public function up(): void
    {
        if (Schema::hasTable('news')) {
            $columns = Schema::getColumnListing('news');
            if (!in_array('category', $columns)) {
                \DB::statement("ALTER TABLE news ADD COLUMN category VARCHAR(255) NULL");
            }
        }
    }

    /**
     * Remove category column from news table
     */
    public function down(): void
    {
        if (Schema::hasTable('news')) {
            $columns = Schema::getColumnListing('news');
            if (in_array('category', $columns)) {
                \DB::statement("ALTER TABLE news DROP COLUMN category");
            }
        }
    }
};
