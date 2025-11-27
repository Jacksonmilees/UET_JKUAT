<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\MemberIdService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get all users (admin only)
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();
            
            // Search by name, email, member_id, or admission_number
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('member_id', 'like', "%{$search}%")
                      ->orWhere('admission_number', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
                });
            }
            
            // Filter by role
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by college
            if ($request->has('college')) {
                $query->where('college', $request->college);
            }
            
            // Filter by year of study
            if ($request->has('year_of_study')) {
                $query->where('year_of_study', $request->year_of_study);
            }
            
            // Filter by ministry interest
            if ($request->has('ministry_interest')) {
                $query->where('ministry_interest', 'like', "%{$request->ministry_interest}%");
            }
            
            // Pagination
            $perPage = $request->get('per_page', 50);
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            // Transform users to include full profile data
            $users->getCollection()->transform(function ($user) {
                return $user->getProfileData();
            });
            
            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'total' => $users->total(),
                    'per_page' => $users->perPage(),
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch users'
            ], 500);
        }
    }

    /**
     * Get a single user
     */
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Get member ID info
            $memberIdInfo = null;
            if ($user->member_id) {
                $memberIdInfo = MemberIdService::getReadableInfo($user->member_id);
            }
            
            $userData = $user->getProfileData();
            $userData['member_id_info'] = $memberIdInfo;
            
            return response()->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }
    }

    /**
     * Update a user (admin only)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone_number' => 'sometimes|string|max:20',
                'year_of_study' => 'sometimes|string|max:50',
                'course' => 'sometimes|string|max:255',
                'college' => 'sometimes|string|max:255',
                'admission_number' => 'sometimes|string|max:50|unique:users,admission_number,' . $id,
                'ministry_interest' => 'sometimes|string|max:255',
                'residence' => 'sometimes|string|max:255',
                'role' => 'sometimes|in:user,admin,super_admin',
                'status' => 'sometimes|in:active,inactive,suspended',
                'avatar' => 'sometimes|string',
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update user'
            ], 500);
        }
    }

    /**
     * Delete a user (admin only)
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Prevent deleting yourself
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Cannot delete your own account'
                ], 403);
            }
            
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete user'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getStats($id)
    {
        try {
            $user = User::findOrFail($id);
            
            $stats = [
                'total_contributions' => 0, // Will be calculated from transactions
                'total_orders' => 0, // Will be calculated from orders
                'total_tickets' => 0, // Will be calculated from tickets
                'registration_date' => $user->created_at,
                'last_login' => $user->last_login_at ?? null,
                'status' => $user->status,
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch user statistics'
            ], 500);
        }
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Current password is incorrect'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update password'
            ], 500);
        }
    }

    /**
     * Toggle user status
     */
    public function toggleStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            
            $newStatus = $user->status === 'active' ? 'inactive' : 'active';
            $user->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User status updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update user status'
            ], 500);
        }
    }
}
