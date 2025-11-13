<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountTypeSeeder extends Seeder
{
    public function run()
    {
        // Account types are already seeded in migrations
        // This seeder can be used for additional data or testing
        if (app()->environment('local', 'testing')) {
            // Create sample family accounts
            $familyType = \App\Models\AccountType::where('code', 'FAM')->first();
            
            $families = [
                ['name' => 'Moriah Family', 'code' => 'MOR'],
                ['name' => 'Decapolians Family', 'code' => 'DEC'],
            ];

            foreach ($families as $family) {
                \App\Models\AccountSubtype::create([
                    'account_type_id' => $familyType->id,
                    'name' => $family['name'],
                    'code' => $family['code'],
                ]);
            }
        }
    }
}