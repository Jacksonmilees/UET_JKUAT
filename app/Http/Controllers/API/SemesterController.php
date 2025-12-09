<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SemesterController extends Controller
{
    /**
     * List all semesters
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Only admin/treasurer can see all semesters
        if (!in_array($user->role, ['admin', 'treasurer', 'auditor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $semesters = Semester::with('creator:id,name')
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($semester) {
                return array_merge($semester->toArray(), [
                    'stats' => $semester->getStats(),
                    'is_current' => $semester->isActive(),
                ]);
            });

        return response()->json([
            'success' => true,
            'data' => $semesters,
        ]);
    }

    /**
     * Get current active semester
     */
    public function current(): JsonResponse
    {
        $semester = Semester::getActive() ?? Semester::getLatest();

        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'No active semester found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => array_merge($semester->toArray(), [
                'stats' => $semester->getStats(),
            ]),
        ]);
    }

    /**
     * Create a new semester
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!in_array($user->role, ['admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can create semesters',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'mandatory_amount' => 'numeric|min:0',
            'notes' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $semester = Semester::create([
            ...$validated,
            'created_by' => $user->id,
            'status' => 'active',
        ]);

        Log::info("Semester created", [
            'semester_id' => $semester->id,
            'name' => $semester->name,
            'created_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Semester created successfully',
            'data' => $semester,
        ], 201);
    }

    /**
     * Get semester details
     */
    public function show(int $id): JsonResponse
    {
        $semester = Semester::with(['creator:id,name'])->find($id);

        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Semester not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => array_merge($semester->toArray(), [
                'stats' => $semester->getStats(),
            ]),
        ]);
    }

    /**
     * Update semester
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();

        if (!in_array($user->role, ['admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can update semesters',
            ], 403);
        }

        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Semester not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'mandatory_amount' => 'numeric|min:0',
            'status' => 'in:active,archived',
            'notes' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $semester->update($validated);

        Log::info("Semester updated", [
            'semester_id' => $semester->id,
            'updated_by' => $user->id,
            'changes' => $validated,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Semester updated successfully',
            'data' => $semester->fresh(),
        ]);
    }

    /**
     * Activate a new semester (archives others and resets payments)
     */
    public function activate(int $id): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can activate semesters',
            ], 403);
        }

        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Semester not found',
            ], 404);
        }

        // Archive all other active semesters
        Semester::where('status', 'active')
            ->where('id', '!=', $id)
            ->update(['status' => 'archived']);

        // Activate this semester
        $semester->update(['status' => 'active']);

        // Assign all active users to this semester and reset their payment status
        $usersUpdated = $semester->assignToAllActiveUsers();

        // Send notification to all users about new semester
        Notification::broadcastToAll(
            'New Semester Started',
            "A new semester '{$semester->name}' has started. Your mandatory contribution status has been reset. Please pay KES {$semester->mandatory_amount} to continue using the platform.",
            '/dashboard'
        );

        Log::info("Semester activated", [
            'semester_id' => $semester->id,
            'name' => $semester->name,
            'users_assigned' => $usersUpdated,
            'activated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Semester '{$semester->name}' activated. {$usersUpdated} users assigned.",
            'data' => [
                'semester' => $semester->fresh(),
                'users_assigned' => $usersUpdated,
            ],
        ]);
    }

    /**
     * Get semester statistics
     */
    public function stats(int $id): JsonResponse
    {
        $user = Auth::user();

        if (!in_array($user->role, ['admin', 'treasurer', 'auditor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Semester not found',
            ], 404);
        }

        // Get detailed payment status
        $paidUsers = User::where('current_semester_id', $id)
            ->where('mandatory_paid_current_semester', true)
            ->select('id', 'name', 'email', 'phone', 'mandatory_paid_at')
            ->get();

        $unpaidUsers = User::where('current_semester_id', $id)
            ->where('mandatory_paid_current_semester', false)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'semester' => $semester,
                'stats' => $semester->getStats(),
                'paid_users' => $paidUsers,
                'unpaid_users' => $unpaidUsers,
            ],
        ]);
    }

    /**
     * Send reminder to unpaid users
     */
    public function sendReminders(int $id): JsonResponse
    {
        $user = Auth::user();

        if (!in_array($user->role, ['admin', 'treasurer'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Semester not found',
            ], 404);
        }

        $unpaidUsers = User::where('current_semester_id', $id)
            ->where('mandatory_paid_current_semester', false)
            ->where('is_active', true)
            ->get();

        $count = 0;
        foreach ($unpaidUsers as $unpaidUser) {
            Notification::createPaymentNotification(
                $unpaidUser->id,
                'Payment Reminder',
                "Reminder: Please pay your mandatory semester contribution of KES {$semester->mandatory_amount} to continue using the platform.",
                ['semester_id' => $semester->id, 'amount' => $semester->mandatory_amount]
            );
            $count++;
        }

        Log::info("Payment reminders sent", [
            'semester_id' => $semester->id,
            'reminders_sent' => $count,
            'sent_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} reminders sent to unpaid users",
            'data' => ['reminders_sent' => $count],
        ]);
    }
}
