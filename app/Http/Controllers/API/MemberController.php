<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MemberController extends Controller
{
    /**
     * Get all members
     * Falls back to Users table if member_db is not available
     */
    public function index(Request $request)
    {
        try {
            $query = Member::query();
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            $members = $query->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            // Log the error
            Log::warning('Member database not available, falling back to Users: ' . $e->getMessage());
            
            // Fallback to Users table
            try {
                $query = User::query();
                
                if ($request->has('status')) {
                    $query->where('status', $request->status);
                }
                
                $users = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
                    return [
                        'MMID' => $user->member_id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'whatsapp' => $user->phone_number,
                        'status' => $user->status,
                        'current_year_of_study' => $user->year_of_study,
                        'course_of_study' => $user->course,
                        'campus' => $user->college,
                        'created_at' => $user->created_at,
                    ];
                });
                
                return response()->json([
                    'success' => true,
                    'data' => $users,
                    'source' => 'users'
                ]);
            } catch (\Exception $fallbackError) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to fetch members',
                    'data' => []
                ], 200); // Return 200 with empty data instead of 500
            }
        }
    }

    /**
     * Get member by MMID
     * Falls back to Users table if member_db is not available
     */
    public function getByMMID($mmid)
    {
        try {
            $member = Member::where('mmid', $mmid)->first();
            
            if (!$member) {
                // Try Users table
                $user = User::where('member_id', $mmid)->first();
                if ($user) {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'MMID' => $user->member_id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'whatsapp' => $user->phone_number,
                            'status' => $user->status,
                            'current_year_of_study' => $user->year_of_study,
                            'course_of_study' => $user->course,
                            'campus' => $user->college,
                            'created_at' => $user->created_at,
                        ],
                        'source' => 'users'
                    ]);
                }
                
                return response()->json([
                    'success' => false,
                    'error' => 'Member not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $member
            ]);
        } catch (\Exception $e) {
            // Fallback to Users table
            Log::warning('Member database not available for getByMMID, falling back to Users: ' . $e->getMessage());
            
            try {
                $user = User::where('member_id', $mmid)->first();
                if ($user) {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'MMID' => $user->member_id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'whatsapp' => $user->phone_number,
                            'status' => $user->status,
                            'current_year_of_study' => $user->year_of_study,
                            'course_of_study' => $user->course,
                            'campus' => $user->college,
                            'created_at' => $user->created_at,
                        ],
                        'source' => 'users'
                    ]);
                }
                
                return response()->json([
                    'success' => false,
                    'error' => 'Member not found'
                ], 404);
            } catch (\Exception $fallbackError) {
                return response()->json([
                    'success' => false,
                    'error' => 'Member not found'
                ], 404);
            }
        }
    }

    /**
     * Search members
     * Falls back to Users table if member_db is not available
     */
    public function search(Request $request)
    {
        try {
            $query = $request->input('query', '');
            
            $members = Member::where('name', 'like', "%{$query}%")
                ->orWhere('mmid', 'like', "%{$query}%")
                ->orWhere('whatsapp', 'like', "%{$query}%")
                ->limit(50)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            // Fallback to Users table
            Log::warning('Member database not available for search, falling back to Users: ' . $e->getMessage());
            
            try {
                $searchQuery = $request->input('query', '');
                
                $users = User::where('name', 'like', "%{$searchQuery}%")
                    ->orWhere('member_id', 'like', "%{$searchQuery}%")
                    ->orWhere('phone_number', 'like', "%{$searchQuery}%")
                    ->orWhere('email', 'like', "%{$searchQuery}%")
                    ->limit(50)
                    ->get()
                    ->map(function ($user) {
                        return [
                            'MMID' => $user->member_id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'whatsapp' => $user->phone_number,
                            'status' => $user->status,
                            'current_year_of_study' => $user->year_of_study,
                            'course_of_study' => $user->course,
                            'campus' => $user->college,
                            'created_at' => $user->created_at,
                        ];
                    });
                
                return response()->json([
                    'success' => true,
                    'data' => $users,
                    'source' => 'users'
                ]);
            } catch (\Exception $fallbackError) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to search members',
                    'data' => []
                ], 200);
            }
        }
    }

    /**
     * Create new member
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mmid' => 'required|string|unique:members,mmid',
                'name' => 'required|string',
                'whatsapp' => 'required|string',
                'wallet_balance' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:active,inactive',
            ]);

            $member = Member::create($validated);

            return response()->json([
                'success' => true,
                'data' => $member,
                'message' => 'Member created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update member
     */
    public function update(Request $request, $id)
    {
        try {
            $member = Member::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string',
                'whatsapp' => 'sometimes|string',
                'wallet_balance' => 'sometimes|numeric|min:0',
                'status' => 'sometimes|in:active,inactive',
            ]);

            $member->update($validated);

            return response()->json([
                'success' => true,
                'data' => $member,
                'message' => 'Member updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member statistics
     */
    public function getStats($id)
    {
        try {
            $member = Member::findOrFail($id);
            
            $stats = [
                'wallet_balance' => $member->wallet_balance ?? 0,
                'total_tickets_sold' => $member->tickets()->count(),
                'total_revenue' => $member->tickets()->where('status', 'completed')->sum('amount'),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch member stats: ' . $e->getMessage()
            ], 500);
        }
    }
}
