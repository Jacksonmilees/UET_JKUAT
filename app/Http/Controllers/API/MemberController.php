<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    /**
     * Get all members
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
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch members: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member by MMID
     */
    public function getByMMID($mmid)
    {
        try {
            $member = Member::where('mmid', $mmid)->first();
            
            if (!$member) {
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
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search members
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
            return response()->json([
                'success' => false,
                'error' => 'Failed to search members: ' . $e->getMessage()
            ], 500);
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
