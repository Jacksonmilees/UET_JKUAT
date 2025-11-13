<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/2024_01_09_000002_create_account_subtypes_table.php
class CreateAccountSubtypesTable extends Migration
{
    public function up()
    {
        Schema::create('account_subtypes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_type_id')->constrained();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Seed default subtypes
        $ministryId = DB::table('account_types')->where('code', 'MIN')->value('id');
        $activityId = DB::table('account_types')->where('code', 'ACT')->value('id');

        DB::table('account_subtypes')->insert([
            ['account_type_id' => $ministryId, 'name' => 'Offering', 'code' => 'OFF'],
            ['account_type_id' => $ministryId, 'name' => 'Tithe', 'code' => 'TIT'],
            ['account_type_id' => $ministryId, 'name' => 'Thanksgiving', 'code' => 'THK'],
            ['account_type_id' => $activityId, 'name' => 'Retreat', 'code' => 'RET'],
            ['account_type_id' => $activityId, 'name' => 'Bonding', 'code' => 'BON'],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('account_subtypes');
    }
}