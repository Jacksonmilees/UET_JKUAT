<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('type')->default('merchandise'); // merchandise, project, news, etc.
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }

        // Add category_id to merchandise if not exists
        if (Schema::hasTable('merchandise') && !Schema::hasColumn('merchandise', 'category_id')) {
            Schema::table('merchandise', function (Blueprint $table) {
                $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('merchandise') && Schema::hasColumn('merchandise', 'category_id')) {
            Schema::table('merchandise', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }
        Schema::dropIfExists('categories');
    }
};
