<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 20);
        $unreadOnly = $request->boolean('unread_only', false);

        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($unreadOnly) {
            $query->where('read', false);
        }

        $notifications = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => Notification::getUnreadCount($user->id),
            ],
        ]);
    }

    /**
     * Get unread count
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'count' => Notification::getUnreadCount($user->id),
            ],
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $id): JsonResponse
    {
        $user = Auth::user();
        $notification = Notification::where('user_id', $user->id)->find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'data' => $notification->fresh(),
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $count = Notification::markAllAsRead($user->id);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read",
            'data' => ['marked_count' => $count],
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy(int $id): JsonResponse
    {
        $user = Auth::user();
        $notification = Notification::where('user_id', $user->id)->find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Broadcast announcement (admin only)
     */
    public function broadcast(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!in_array($user->role, ['admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can broadcast announcements',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'action_url' => 'nullable|string|max:500',
        ]);

        $count = Notification::broadcastToAll(
            $validated['title'],
            $validated['message'],
            $validated['action_url'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => "Announcement sent to {$count} users",
            'data' => ['recipients' => $count],
        ], 201);
    }

    /**
     * Get recent notifications (for notification bell)
     */
    public function recent(): JsonResponse
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => Notification::getRecent($user->id, 5),
                'unread_count' => Notification::getUnreadCount($user->id),
            ],
        ]);
    }
}
