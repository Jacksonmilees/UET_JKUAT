<?php
namespace Database\Seeders;

use App\Models\Project;
use App\Models\Donation;
use Illuminate\Database\Seeder;

class DonationSeeder extends Seeder
{
    public function run()
    {
        $projects = Project::all();
        
        $donors = [
            ['name' => 'John Kamau', 'phone' => '+254712345678'],
            ['name' => 'Mary Wanjiku', 'phone' => '+254723456789'],
            ['name' => 'Peter Ochieng', 'phone' => '+254734567890'],
            ['name' => 'Sarah Otieno', 'phone' => '+254745678901'],
            ['name' => 'James Mwangi', 'phone' => '+254756789012'],
            ['name' => 'Grace Njeri', 'phone' => '+254767890123'],
            ['name' => 'David Kiprop', 'phone' => '+254778901234'],
            ['name' => 'Ruth Adhiambo', 'phone' => '+254789012345']
        ];

        foreach ($projects as $project) {
            // Generate 5-10 random donations for each project
            $numDonations = rand(5, 10);
            
            for ($i = 0; $i < $numDonations; $i++) {
                $donor = $donors[array_rand($donors)];
                $amount = rand(1000, 50000);
                
                Donation::create([
                    'project_id' => $project->id,
                    'amount' => $amount,
                    'transaction_id' => 'PGH' . strtoupper(uniqid()),
                    'phone_number' => $donor['phone'],
                    'donor_name' => $donor['name'],
                    'status' => 'completed'
                ]);
            }
        }
    }
}