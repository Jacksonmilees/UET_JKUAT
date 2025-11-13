<?php
namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run()
    {
        $projects = [
            [
                'title' => 'Church Building Fund',
                'description' => 'Support the construction of our new church building at JKUAT. This new facility will accommodate our growing congregation and provide space for various ministry activities.',
                'target_amount' => 2500000.00,
                'current_amount' => 750000.00,
                'account_number' => 'CBF2024',
                'status' => 'active',
                'end_date' => '2024-12-31',
                'image_url' => 'https://example.com/church-building.jpg'
            ],
            [
                'title' => 'Youth Mission Trip',
                'description' => 'Help send our youth team on a mission trip to spread the gospel in rural areas. The funds will cover transportation, accommodation, and mission materials.',
                'target_amount' => 500000.00,
                'current_amount' => 150000.00,
                'account_number' => 'YMT2024',
                'status' => 'active',
                'end_date' => '2024-06-30',
                'image_url' => 'https://example.com/mission-trip.jpg'
            ],
            [
                'title' => 'Community Outreach Program',
                'description' => 'Support our monthly community outreach program providing food, clothing, and spiritual support to vulnerable communities around JKUAT.',
                'target_amount' => 300000.00,
                'current_amount' => 125000.00,
                'account_number' => 'COP2024',
                'status' => 'active',
                'end_date' => '2024-12-31',
                'image_url' => 'https://example.com/outreach.jpg'
            ],
            [
                'title' => 'Worship Equipment Fund',
                'description' => 'Help us upgrade our worship equipment including musical instruments, sound system, and multimedia tools for better worship experience.',
                'target_amount' => 800000.00,
                'current_amount' => 350000.00,
                'account_number' => 'WEF2024',
                'status' => 'active',
                'end_date' => '2024-09-30',
                'image_url' => 'https://example.com/worship.jpg'
            ],
            [
                'title' => 'Bible Study Materials',
                'description' => 'Support the purchase of bible study materials and resources for our growing small groups ministry.',
                'target_amount' => 150000.00,
                'current_amount' => 75000.00,
                'account_number' => 'BSM2024',
                'status' => 'active',
                'end_date' => '2024-08-31',
                'image_url' => 'https://example.com/bible-study.jpg'
            ]
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}