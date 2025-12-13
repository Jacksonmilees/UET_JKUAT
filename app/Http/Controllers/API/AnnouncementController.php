<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnnouncementController extends Controller
{
    /**
     * Get all announcements
     */
    public function index(Request $request)
    {
        try {
            $query = Announcement::query();

            // Support 'all' parameter for admin to see all items
            if ($request->has('all') && $request->boolean('all')) {
                // No filter - return all announcements
            } elseif ($request->has('active')) {
                // Filter by specific active status
                $query->where('active', $request->boolean('active'));
            } else {
                // Default to active only for public users
                $query->where('active', true);
            }

            $announcements = $query
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $announcements
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching announcements: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch announcements',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get a single announcement
     */
    public function show($id)
    {
        try {
            $announcement = Announcement::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $announcement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Announcement not found'
            ], 404);
        }
    }

    /**
     * Create a new announcement (admin only)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'priority' => 'required|in:low,medium,high',
                'active' => 'boolean',
                'expires_at' => 'nullable|date',
            ]);

            $announcement = Announcement::create($validated);

            return response()->json([
                'success' => true,
                'data' => $announcement,
                'message' => 'Announcement created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating announcement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create announcement'
            ], 500);
        }
    }

    /**
     * Update an announcement (admin only)
     */
    public function update(Request $request, $id)
    {
        try {
            $announcement = Announcement::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'message' => 'sometimes|string',
                'priority' => 'sometimes|in:low,medium,high',
                'active' => 'sometimes|boolean',
                'expires_at' => 'nullable|date',
            ]);

            $announcement->update($validated);

            return response()->json([
                'success' => true,
                'data' => $announcement,
                'message' => 'Announcement updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating announcement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update announcement'
            ], 500);
        }
    }

    /**
     * Delete an announcement (admin only)
     */
    public function destroy($id)
    {
        try {
            $announcement = Announcement::findOrFail($id);
            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting announcement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete announcement'
            ], 500);
        }
    }

    /**
     * Toggle announcement active status
     */
    public function toggleActive($id)
    {
        try {
            $announcement = Announcement::findOrFail($id);
            $announcement->update(['active' => !$announcement->active]);

            return response()->json([
                'success' => true,
                'data' => $announcement,
                'message' => 'Announcement status updated'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update announcement status'
            ], 500);
        }
    }
}
