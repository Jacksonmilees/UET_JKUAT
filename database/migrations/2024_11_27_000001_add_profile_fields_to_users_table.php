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
            // Member ID - Format: UETJ1234AK27 (UETJ + 4 random digits + year letter + month letter + day)
            $table->string('member_id')->unique()->nullable()->after('id');
            
            // Contact Information
            $table->string('phone_number')->nullable()->after('email');
            
            // Academic Information
            $table->string('year_of_study')->nullable()->after('phone_number');
            $table->string('course')->nullable()->after('year_of_study');
            $table->string('college')->nullable()->after('course');
            $table->string('admission_number')->unique()->nullable()->after('college');
            
            // Ministry & Personal Information
            $table->string('ministry_interest')->nullable()->after('admission_number');
            $table->string('residence')->nullable()->after('ministry_interest');
            
            // User Role & Status
            $table->string('role')->default('user')->after('residence'); // user, admin, super_admin
            $table->string('status')->default('active')->after('role'); // active, inactive, suspended
            
            // Avatar/Profile Picture
            $table->string('avatar')->nullable()->after('status');
            
            // Registration Date Tracking
            $table->timestamp('registration_completed_at')->nullable()->after('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'member_id',
                'phone_number',
                'year_of_study',
                'course',
                'college',
                'admission_number',
                'ministry_interest',
                'residence',
                'role',
                'status',
                'avatar',
                'registration_completed_at',
            ]);
        });
    }
};
