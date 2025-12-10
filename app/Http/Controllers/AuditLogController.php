<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditLogController extends Controller
{
    /**
     * Get audit logs with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-audit-logs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view audit logs',
                ], 403);
            }

            $query = AuditLog::with(['user:id,name,email']);

            // Filter by user
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by event type
            if ($request->has('event')) {
                $query->where('event', $request->event);
            }

            // Filter by auditable type (model)
            if ($request->has('auditable_type')) {
                $query->where('auditable_type', $request->auditable_type);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('created_at', '<=', $request->end_date);
            }

            // Filter by IP address
            if ($request->has('ip_address')) {
                $query->where('ip_address', $request->ip_address);
            }

            // Search in metadata
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereJsonContains('metadata', $search)
                        ->orWhereJsonContains('old_values', $search)
                        ->orWhereJsonContains('new_values', $search);
                });
            }

            $logs = $query->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 50);

            return response()->json([
                'success' => true,
                'logs' => $logs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audit logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific audit log details
     */
    public function show(Request $request, AuditLog $auditLog)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-audit-logs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view audit logs',
                ], 403);
            }

            $auditLog->load(['user:id,name,email', 'auditable']);

            return response()->json([
                'success' => true,
                'log' => $auditLog,
                'changed_fields' => $auditLog->getChangedFields(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audit log',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get audit logs for a specific entity
     */
    public function entityLogs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'auditable_type' => 'required|string',
            'auditable_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check permission
            if (!$request->user()->hasPermission('view-audit-logs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view audit logs',
                ], 403);
            }

            $logs = AuditLog::where('auditable_type', $request->auditable_type)
                ->where('auditable_id', $request->auditable_id)
                ->with(['user:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'logs' => $logs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch entity logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get audit log statistics
     */
    public function statistics(Request $request)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-audit-logs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view audit logs',
                ], 403);
            }

            $dateFilter = $request->has('days')
                ? now()->subDays($request->days)
                : now()->subDays(30);

            $eventStats = AuditLog::where('created_at', '>=', $dateFilter)
                ->selectRaw('event, COUNT(*) as count')
                ->groupBy('event')
                ->get();

            $modelStats = AuditLog::where('created_at', '>=', $dateFilter)
                ->selectRaw('auditable_type, COUNT(*) as count')
                ->whereNotNull('auditable_type')
                ->groupBy('auditable_type')
                ->orderByDesc('count')
                ->limit(10)
                ->get();

            $userStats = AuditLog::where('created_at', '>=', $dateFilter)
                ->selectRaw('user_id, COUNT(*) as count')
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->orderByDesc('count')
                ->limit(10)
                ->with('user:id,name,email')
                ->get();

            $dailyActivity = AuditLog::where('created_at', '>=', $dateFilter)
                ->selectRaw('DATE(created_at) as date, event, COUNT(*) as count')
                ->groupBy('date', 'event')
                ->orderBy('date', 'desc')
                ->get()
                ->groupBy('date');

            $recentCritical = AuditLog::where('created_at', '>=', $dateFilter)
                ->whereIn('event', ['deleted', 'updated'])
                ->whereIn('auditable_type', [
                    'App\\Models\\User',
                    'App\\Models\\Withdrawal',
                    'App\\Models\\Role',
                    'App\\Models\\Project',
                ])
                ->with(['user:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'statistics' => [
                    'total_events' => AuditLog::where('created_at', '>=', $dateFilter)->count(),
                    'unique_users' => AuditLog::where('created_at', '>=', $dateFilter)->distinct('user_id')->count('user_id'),
                    'unique_ip_addresses' => AuditLog::where('created_at', '>=', $dateFilter)->distinct('ip_address')->count('ip_address'),
                    'event_breakdown' => $eventStats,
                    'model_breakdown' => $modelStats,
                    'top_users' => $userStats,
                    'daily_activity' => $dailyActivity,
                    'recent_critical' => $recentCritical,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export audit logs
     */
    public function export(Request $request)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('export-audit-logs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to export audit logs',
                ], 403);
            }

            $query = AuditLog::with(['user:id,name,email']);

            // Apply same filters as index
            if ($request->has('user_id')) $query->where('user_id', $request->user_id);
            if ($request->has('event')) $query->where('event', $request->event);
            if ($request->has('auditable_type')) $query->where('auditable_type', $request->auditable_type);
            if ($request->has('start_date')) $query->where('created_at', '>=', $request->start_date);
            if ($request->has('end_date')) $query->where('created_at', '<=', $request->end_date);

            $logs = $query->orderBy('created_at', 'desc')->get();

            // Convert to CSV format
            $csvData = $this->convertToCSV($logs);

            return response($csvData, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="audit_logs_' . now()->format('Y-m-d_His') . '.csv"',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export audit logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert logs to CSV format
     */
    protected function convertToCSV($logs)
    {
        $output = fopen('php://temp', 'r+');

        // Headers
        fputcsv($output, [
            'ID',
            'Date/Time',
            'User',
            'Event',
            'Model Type',
            'Model ID',
            'IP Address',
            'User Agent',
            'URL',
            'Method',
            'Changes',
        ]);

        // Data rows
        foreach ($logs as $log) {
            $changes = '';
            if ($log->old_values && $log->new_values) {
                $changedFields = $log->getChangedFields();
                $changes = json_encode($changedFields);
            } elseif ($log->new_values) {
                $changes = 'Created: ' . json_encode($log->new_values);
            } elseif ($log->old_values) {
                $changes = 'Deleted: ' . json_encode($log->old_values);
            }

            fputcsv($output, [
                $log->id,
                $log->created_at->format('Y-m-d H:i:s'),
                $log->user ? $log->user->name : 'System',
                $log->event,
                $log->auditable_type ?? '',
                $log->auditable_id ?? '',
                $log->ip_address ?? '',
                $log->user_agent ?? '',
                $log->url ?? '',
                $log->method ?? '',
                $changes,
            ]);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Get available audit event types
     */
    public function eventTypes(Request $request)
    {
        try {
            if (!$request->user()->hasPermission('view-audit-logs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $eventTypes = AuditLog::distinct('event')->pluck('event');
            $auditableTypes = AuditLog::distinct('auditable_type')
                ->whereNotNull('auditable_type')
                ->pluck('auditable_type')
                ->map(function ($type) {
                    // Convert class name to readable format
                    return [
                        'value' => $type,
                        'label' => class_basename($type),
                    ];
                });

            return response()->json([
                'success' => true,
                'event_types' => $eventTypes,
                'auditable_types' => $auditableTypes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch event types',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
