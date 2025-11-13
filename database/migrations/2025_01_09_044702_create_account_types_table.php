<?php
// database/migrations/2024_01_09_000001_create_account_types_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAccountTypesTable extends Migration
{
    public function up()
    {
        Schema::create('account_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Seed default account types
        DB::table('account_types')->insert([
            ['name' => 'Ministry', 'code' => 'MIN', 'description' => 'Ministry accounts'],
            ['name' => 'Activity', 'code' => 'ACT', 'description' => 'Activity accounts'],
            ['name' => 'Project', 'code' => 'PRJ', 'description' => 'Project accounts'],
            ['name' => 'Wallet', 'code' => 'WAL', 'description' => 'Individual wallet accounts'],
            ['name' => 'Family', 'code' => 'FAM', 'description' => 'Family accounts'],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('account_types');
    }
}