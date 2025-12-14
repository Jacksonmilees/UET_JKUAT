<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add status column to news table if missing (raw SQL fallback)
     */
    public function up(): void
    {
        if (Schema::hasTable('news')) {
            $columns = Schema::getColumnListing('news');
            if (!in_array('status', $columns)) {
                \DB::statement("ALTER TABLE news ADD COLUMN status VARCHAR(255) NULL");
            }
        }
    }

    /**
     * Remove status column from news table
     */
    public function down(): void
    {
        if (Schema::hasTable('news')) {
            $columns = Schema::getColumnListing('news');
            if (in_array('status', $columns)) {
                \DB::statement("ALTER TABLE news DROP COLUMN status");
            }
        }
    }
};
