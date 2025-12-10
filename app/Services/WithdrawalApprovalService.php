<?php

namespace App\Services;

use App\Models\Withdrawal;
use App\Models\WithdrawalApproval;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class WithdrawalApprovalService
{
    /**
     * Create approval request for withdrawal
     */
    public function createApprovalRequest(Withdrawal $withdrawal, User $approver = null)
    {
        // If no approver specified, find treasurer or super admin
        if (!$approver) {
            $approver = $this->getDefaultApprover();
        }

        if (!$approver) {
            throw new \Exception('No approver found. Please assign a Treasurer role.');
        }

        $approval = WithdrawalApproval::create([
            'withdrawal_id' => $withdrawal->id,
            'approver_id' => $approver->id,
            'status' => 'pending',
        ]);

        // Update withdrawal status
        $withdrawal->update([
            'requires_approval' => true,
            'approval_status' => 'pending',
        ]);

        // Send notification to approver
        // TODO: Implement notification
        // Notification::send($approver, new WithdrawalApprovalRequested($withdrawal));

        return $approval;
    }

    /**
     * Get default approver (Treasurer or Super Admin)
     */
    protected function getDefaultApprover()
    {
        // Try to find treasurer
        $treasurer = User::whereHas('roles', function ($query) {
            $query->where('slug', 'treasurer');
        })->first();

        if ($treasurer) {
            return $treasurer;
        }

        // Fallback to super admin
        return User::whereHas('roles', function ($query) {
            $query->where('slug', 'super-admin');
        })->first();
    }

    /**
     * Request OTP for approval
     */
    public function requestOTP(WithdrawalApproval $approval, User $user)
    {
        // Verify user is the assigned approver
        if ($approval->approver_id !== $user->id) {
            throw new \Exception('You are not authorized to approve this withdrawal');
        }

        // Verify approval is pending
        if ($approval->status !== 'pending') {
            throw new \Exception('This withdrawal approval is not pending');
        }

        // Generate and save OTP
        $otp = $approval->generateOTP();

        // Send OTP via SMS
        // TODO: Implement SMS sending
        // $this->sendOTPSMS($user->phone, $otp);

        // For development/testing, log the OTP
        \Log::info('Withdrawal Approval OTP', [
            'withdrawal_id' => $approval->withdrawal_id,
            'approver_id' => $user->id,
            'otp' => $otp,
        ]);

        return [
            'success' => true,
            'message' => 'OTP sent to your registered phone number',
            'expires_at' => $approval->otp_expires_at,
        ];
    }

    /**
     * Approve withdrawal with OTP verification
     */
    public function approveWithdrawal(WithdrawalApproval $approval, User $user, string $otp, string $notes = null)
    {
        return DB::transaction(function () use ($approval, $user, $otp, $notes) {
            // Verify user is the assigned approver
            if ($approval->approver_id !== $user->id) {
                throw new \Exception('You are not authorized to approve this withdrawal');
            }

            // Verify approval is pending
            if ($approval->status !== 'pending') {
                throw new \Exception('This withdrawal has already been processed');
            }

            // Verify OTP
            if (!$approval->verifyOTP($otp)) {
                throw new \Exception('Invalid or expired OTP');
            }

            // Update approval
            $approval->update([
                'status' => 'approved',
                'notes' => $notes,
                'approved_at' => now(),
            ]);

            // Update withdrawal
            $withdrawal = $approval->withdrawal;
            $withdrawal->update([
                'approval_status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);

            // Log the approval
            activity()
                ->performedOn($withdrawal)
                ->causedBy($user)
                ->withProperties([
                    'action' => 'withdrawal_approved',
                    'approval_id' => $approval->id,
                    'notes' => $notes,
                ])
                ->log('Withdrawal approved');

            // TODO: Trigger automatic processing if configured
            // $this->processWithdrawal($withdrawal);

            return [
                'success' => true,
                'message' => 'Withdrawal approved successfully',
                'withdrawal' => $withdrawal->fresh(),
            ];
        });
    }

    /**
     * Reject withdrawal
     */
    public function rejectWithdrawal(WithdrawalApproval $approval, User $user, string $reason, string $otp = null)
    {
        return DB::transaction(function () use ($approval, $user, $reason, $otp) {
            // Verify user is the assigned approver
            if ($approval->approver_id !== $user->id) {
                throw new \Exception('You are not authorized to reject this withdrawal');
            }

            // Verify approval is pending
            if ($approval->status !== 'pending') {
                throw new \Exception('This withdrawal has already been processed');
            }

            // If OTP is required, verify it
            if ($otp && !$approval->verifyOTP($otp)) {
                throw new \Exception('Invalid or expired OTP');
            }

            // Update approval
            $approval->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
                'rejected_at' => now(),
            ]);

            // Update withdrawal
            $withdrawal = $approval->withdrawal;
            $withdrawal->update([
                'approval_status' => 'rejected',
                'status' => 'rejected',
            ]);

            // Log the rejection
            activity()
                ->performedOn($withdrawal)
                ->causedBy($user)
                ->withProperties([
                    'action' => 'withdrawal_rejected',
                    'approval_id' => $approval->id,
                    'reason' => $reason,
                ])
                ->log('Withdrawal rejected');

            // Send notification to requester
            // TODO: Implement notification
            // Notification::send($withdrawal->user, new WithdrawalRejected($withdrawal, $reason));

            return [
                'success' => true,
                'message' => 'Withdrawal rejected',
                'withdrawal' => $withdrawal->fresh(),
            ];
        });
    }

    /**
     * Get pending approvals for user
     */
    public function getPendingApprovals(User $user)
    {
        return WithdrawalApproval::where('approver_id', $user->id)
            ->where('status', 'pending')
            ->with(['withdrawal.user', 'withdrawal.account'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get approval history for user
     */
    public function getApprovalHistory(User $user, $limit = 50)
    {
        return WithdrawalApproval::where('approver_id', $user->id)
            ->with(['withdrawal.user', 'withdrawal.account'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get approval statistics for user
     */
    public function getApprovalStatistics(User $user, $days = 30)
    {
        $startDate = now()->subDays($days);

        $stats = WithdrawalApproval::where('approver_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                status,
                COUNT(*) as count,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_count,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_count
            ')
            ->groupBy('status')
            ->get();

        $totalAmount = Withdrawal::whereHas('approvals', function ($query) use ($user, $startDate) {
            $query->where('approver_id', $user->id)
                ->where('status', 'approved')
                ->where('approved_at', '>=', $startDate);
        })->sum('amount');

        return [
            'total_processed' => $stats->sum('count'),
            'approved' => $stats->where('status', 'approved')->sum('count'),
            'rejected' => $stats->where('status', 'rejected')->sum('count'),
            'pending' => $stats->where('status', 'pending')->sum('count'),
            'total_amount_approved' => $totalAmount,
            'average_approval_time' => $this->getAverageApprovalTime($user, $days),
        ];
    }

    /**
     * Calculate average approval time
     */
    protected function getAverageApprovalTime(User $user, $days)
    {
        $approvals = WithdrawalApproval::where('approver_id', $user->id)
            ->where('status', 'approved')
            ->where('approved_at', '>=', now()->subDays($days))
            ->get();

        if ($approvals->isEmpty()) {
            return 0;
        }

        $totalSeconds = $approvals->sum(function ($approval) {
            return $approval->approved_at->diffInSeconds($approval->created_at);
        });

        return round($totalSeconds / $approvals->count() / 3600, 2); // Convert to hours
    }

    /**
     * Check if user can approve withdrawals
     */
    public function canApprove(User $user): bool
    {
        return $user->hasPermission('approve-withdrawals') ||
               $user->hasRole('treasurer') ||
               $user->isSuperAdmin();
    }

    /**
     * Get all pending approvals (admin view)
     */
    public function getAllPendingApprovals()
    {
        return WithdrawalApproval::where('status', 'pending')
            ->with(['withdrawal.user', 'withdrawal.account', 'approver'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Reassign approval to different user
     */
    public function reassignApproval(WithdrawalApproval $approval, User $newApprover, User $reassignedBy)
    {
        if ($approval->status !== 'pending') {
            throw new \Exception('Can only reassign pending approvals');
        }

        if (!$reassignedBy->isSuperAdmin()) {
            throw new \Exception('Only super admins can reassign approvals');
        }

        $oldApproverId = $approval->approver_id;

        $approval->update([
            'approver_id' => $newApprover->id,
        ]);

        // Log the reassignment
        activity()
            ->performedOn($approval)
            ->causedBy($reassignedBy)
            ->withProperties([
                'action' => 'approval_reassigned',
                'old_approver_id' => $oldApproverId,
                'new_approver_id' => $newApprover->id,
            ])
            ->log('Withdrawal approval reassigned');

        return $approval->fresh();
    }
}
