<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get all users (admin only)
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();
            
            // Filter by role
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            $users = $query->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $users
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
            
            return response()->json([
                'success' => true,
                'data' => $user
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
                'phone_number' => 'sometimes|string',
                'role' => 'sometimes|in:user,admin,super_admin',
                'status' => 'sometimes|in:active,inactive,suspended',
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
