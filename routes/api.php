<?php
// routes/api.php
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\MpesaController;
use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\MpesaCallbackController;
use App\Http\Controllers\API\CreateAccountController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\API\CheckAccountController;
use App\Http\Controllers\MpesaB2CWithdrawalController;
use App\Http\Controllers\API\MpesaBalanceController;
use App\Http\Controllers\API\AirtimeController;
use App\Http\Controllers\WhatsAppWebController;
use App\Http\Middleware\ApiKeyMiddleware;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Middleware\WithdrawalApiMiddleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OTPAuthController;
use App\Http\Controllers\API\UploadController;
use App\Http\Controllers\API\OnboardingController;
use App\Http\Controllers\API\SemesterController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\AccountRechargeController;
use App\Http\Middleware\CheckRolePermission;
use Illuminate\Http\Request;

// Debug route to confirm middleware registration
Route::get('/debug-middleware', function () {
    $router = app('router');
    return response()->json([
        'middleware_aliases' => $router->getMiddleware(),
        'middleware_groups' => $router->getMiddlewareGroups(),
    ]);
});

// Public routes
Route::get('/tickets/{mmid}', [TicketController::class, 'showPurchasePage'])->name('tickets.purchase');
Route::get('/tickets/{mmid}/purchase', [TicketController::class, 'showPurchasePage'])->name('tickets.purchase');
Route::post('/tickets/{mmid}/process', [TicketController::class, 'processPurchase'])
    ->name('tickets.process');
Route::post('/mpesa/callback', [MpesaController::class, 'handleCallback'])->name('mpesa.callback.legacy');
Route::get('/tickets/check-payment-status/{ticketNumber}', [TicketController::class, 'checkPaymentStatus'])->name('tickets.checkPaymentStatus');
Route::get('/tickets/completed/{mmid}', [TicketController::class, 'fetchCompletedTicketSales']);
Route::match(['get', 'post'], '/winner-selection', [TicketController::class, 'winnerSelection'])->name('winner.selection');

Route::post('webhook/whatsapp', [WhatsAppWebController::class, 'handleWebhook']);

Route::middleware(['api'])
    ->prefix('v1')
    ->group(function () {
        Route::post('/payments/mpesa/callback', [MpesaCallbackController::class, 'handle'])
            ->name('mpesa.callback');
        Route::post('/payments/confirmation', [MpesaCallbackController::class, 'handle'])
            ->name('payments.confirmation');
        Route::post('/payments/validation', [MpesaCallbackController::class, 'handle'])
            ->name('payments.validation');
        Route::post('/mpesa/b2c/result', [MpesaB2CWithdrawalController::class, 'handleWithdrawalResult'])
            ->name('api.mpesa.b2c.result');
        Route::post('/mpesa/b2c/timeout', [MpesaB2CWithdrawalController::class, 'handleWithdrawalTimeout'])
            ->name('api.mpesa.b2c.timeout');
      
        Route::post('withdrawals', [WithdrawalController::class, 'initiateWithdrawal']);
        Route::get('withdrawals', [WithdrawalController::class, 'getWithdrawals']);
        Route::get('withdrawals/{id}', [WithdrawalController::class, 'getWithdrawal']);
    });

Route::prefix('whatsapp')->group(function () {
    Route::get('/start', [WhatsAppWebController::class, 'startSession']);
    Route::get('/qr', [WhatsAppWebController::class, 'getQR']);
    Route::post('/webhook', [WhatsAppWebController::class, 'handleMessage']);
});

Route::match(['GET', 'POST'], '/mpesa/balance/query', [MpesaBalanceController::class, 'query'])->name('mpesa.balance.query');
Route::post('/mpesa/balance/result', [MpesaBalanceController::class, 'handleResult'])->name('mpesa.balance.result');
Route::post('/mpesa/balance/timeout', [MpesaBalanceController::class, 'handleTimeout'])->name('mpesa.balance.timeout');

// Settings public route (outside v1 prefix for frontend compatibility)
Route::get('/settings/public', [\App\Http\Controllers\API\SettingsController::class, 'publicSettings']);

// Public routes (no API key required)
Route::prefix('v1')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']); // Public read access
    Route::get('/projects/{id}', [ProjectController::class, 'show']); // Public read access
    Route::get('/projects/{project}/donations', [ProjectController::class, 'donations']);

    // User-scoped convenience endpoints using bearer token (no API key required)
    Route::get('/accounts/my', [AccountController::class, 'myAccounts']);
    Route::get('/accounts/balance', [AccountController::class, 'getBalance']);
    Route::get('/transactions/my', [TransactionController::class, 'myTransactions']);
    Route::get('/withdrawals/my', [WithdrawalController::class, 'getMyWithdrawals']);
    Route::get('/tickets/my', [TicketController::class, 'getMyTickets']);
    
    // Public access to transactions and withdrawals (read-only)
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::get('/withdrawals', [WithdrawalController::class, 'getWithdrawals']);
    Route::get('/withdrawals/{id}', [WithdrawalController::class, 'getWithdrawal']);
    
    // All accounts with transactions (for debugging)
    Route::get('/accounts-all', function () {
        try {
            $accounts = DB::table('accounts')
                ->select('id', 'reference', 'name', 'type', 'balance', 'created_at')
                ->latest('created_at')
                ->limit(50)
                ->get();
            return response()->json(['status' => 'success', 'data' => $accounts, 'count' => $accounts->count()]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage(), 'data' => []]);
        }
    });
    
    // News routes (public read access)
    Route::get('/news', [\App\Http\Controllers\API\NewsController::class, 'index']);
    Route::get('/news/{id}', [\App\Http\Controllers\API\NewsController::class, 'show']);
    
    // User-specific routes (return empty data for now - can be secured later)
    Route::get('/accounts/my', function () {
        return response()->json(['status' => 'success', 'data' => []]);
    });
    Route::get('/tickets/my', function () {
        return response()->json(['status' => 'success', 'data' => []]);
    });
    
    // M-Pesa transaction logs (public read access)
    Route::get('/mpesa-transactions', function () {
        try {
            $logs = DB::table('mpesa_transaction_logs')->latest('created_at')->limit(100)->get();
            return response()->json(['status' => 'success', 'data' => $logs, 'count' => $logs->count()]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage(), 'data' => []]);
        }
    });
    
    // Test transaction endpoints (for debugging)
    Route::post('/test-transactions/create', [\App\Http\Controllers\API\TestTransactionController::class, 'createTestTransactions']);
    Route::delete('/test-transactions/clear', [\App\Http\Controllers\API\TestTransactionController::class, 'clearTestTransactions']);
    Route::get('/test-transactions/stats', [\App\Http\Controllers\API\TestTransactionController::class, 'getCallbackStats']);
    
    // M-Pesa import endpoints (import real transactions)
    Route::post('/mpesa/import-real-transactions', [\App\Http\Controllers\API\MpesaImportController::class, 'importRealTransactions']);
    Route::get('/mpesa/import-stats', [\App\Http\Controllers\API\MpesaImportController::class, 'getImportStats']);
    Route::post('/mpesa/add-transaction', [\App\Http\Controllers\API\MpesaImportController::class, 'addManualTransaction']);
    Route::get('/mpesa/all-transactions', [\App\Http\Controllers\API\MpesaImportController::class, 'getAllMpesaTransactions']);
    Route::post('/mpesa/sync-from-org-portal', [\App\Http\Controllers\API\MpesaImportController::class, 'syncFromOrgPortal']);
    
    // Admin Dashboard endpoints
    Route::get('/admin/dashboard/stats', [\App\Http\Controllers\API\AdminDashboardController::class, 'getDashboardStats']);
    Route::get('/admin/dashboard/paybill-balance', [\App\Http\Controllers\API\AdminDashboardController::class, 'getPayBillBalance']);
    Route::get('/admin/dashboard/transaction-summary', [\App\Http\Controllers\API\AdminDashboardController::class, 'getTransactionSummary']);
    
    // Account Management endpoints
    Route::post('/admin/accounts/create', [\App\Http\Controllers\API\AccountManagementController::class, 'createAccount']);
    Route::get('/admin/accounts', [\App\Http\Controllers\API\AccountManagementController::class, 'getAllAccounts']);
    Route::get('/admin/accounts/{accountReference}/monthly-total', [\App\Http\Controllers\API\AccountManagementController::class, 'getAccountMonthlyTotal']);
    Route::put('/admin/accounts/{id}', [\App\Http\Controllers\API\AccountManagementController::class, 'updateAccount']);
    
    // Report Generation endpoints
    Route::get('/admin/reports/financial', [\App\Http\Controllers\API\ReportGenerationController::class, 'generateFinancialReport']);
    Route::get('/admin/reports/projects', [\App\Http\Controllers\API\ReportGenerationController::class, 'generateProjectReport']);
    Route::get('/admin/reports/projects/{projectId}', [\App\Http\Controllers\API\ReportGenerationController::class, 'generateProjectReport']);
    Route::get('/admin/reports/account-statement/{accountReference}', [\App\Http\Controllers\API\ReportGenerationController::class, 'generateAccountStatement']);
    Route::get('/admin/reports/monthly-summary', [\App\Http\Controllers\API\ReportGenerationController::class, 'generateMonthlySummary']);
    
    // Settings endpoints (public read for visible_modules)
    Route::get('/settings/public', [\App\Http\Controllers\API\SettingsController::class, 'publicSettings']);
    Route::get('/settings', [\App\Http\Controllers\API\SettingsController::class, 'index']);
    Route::put('/settings', [\App\Http\Controllers\API\SettingsController::class, 'update']);
    Route::post('/settings/upload-image', [\App\Http\Controllers\API\SettingsController::class, 'uploadChairImage']);
    Route::delete('/settings/chair-image', [\App\Http\Controllers\API\SettingsController::class, 'removeChairImage']);
    
    // Public read endpoints for merchandise/announcements (moved outside middleware)
});

// Public API routes (no API key required) - READ-only access
Route::prefix('v1')->group(function () {
    // Settings (public)
    Route::get('/settings/public', [\App\Http\Controllers\API\SettingsController::class, 'publicSettings']);
    Route::get('/settings', [\App\Http\Controllers\API\SettingsController::class, 'index']);
    
    // Announcements (public read)
    Route::get('/announcements', [\App\Http\Controllers\API\AnnouncementController::class, 'index']);
    Route::get('/announcements/{id}', [\App\Http\Controllers\API\AnnouncementController::class, 'show']);
    
    // Merchandise (public read)
    Route::get('/merchandise', [\App\Http\Controllers\API\MerchandiseController::class, 'index']);
    Route::get('/merchandise/{id}', [\App\Http\Controllers\API\MerchandiseController::class, 'show']);
    
    // Uploads (public access)
    Route::get('/uploads', [\App\Http\Controllers\API\UploadController::class, 'index']);
    Route::get('/uploads/{id}', [\App\Http\Controllers\API\UploadController::class, 'show']);
    
    // Members search (public)
    Route::get('/members', [\App\Http\Controllers\API\MemberController::class, 'index']);
    Route::get('/members/mmid/{mmid}', [\App\Http\Controllers\API\MemberController::class, 'getByMMID']);
    Route::post('/members/search', [\App\Http\Controllers\API\MemberController::class, 'search']);
    
    // Notifications (requires bearer token, handled in controller)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/recent', [NotificationController::class, 'recent']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Orders (user's own orders - requires bearer token)
    Route::get('/orders', [\App\Http\Controllers\API\OrderController::class, 'getAllOrders']);
    Route::get('/orders/my', [\App\Http\Controllers\API\OrderController::class, 'index']);
    Route::get('/orders/{id}', [\App\Http\Controllers\API\OrderController::class, 'show']);
    
    // Users (admin access - requires bearer token with admin role)
    Route::get('/users', [\App\Http\Controllers\API\UserController::class, 'index']);
    Route::get('/users/{id}', [\App\Http\Controllers\API\UserController::class, 'show']);
    Route::get('/users/{id}/stats', [\App\Http\Controllers\API\UserController::class, 'getStats']);
});

// Simple Auth routes for frontend (public path /api/auth/*)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::get('me', [AuthController::class, 'me']);
    
    // OTP Authentication routes (for login - user must exist)
    Route::post('otp/request', [OTPAuthController::class, 'requestOTP']);
    Route::post('otp/verify', [OTPAuthController::class, 'verifyOTPAndLogin']);
    Route::get('otp/status', [OTPAuthController::class, 'checkOTPServiceStatus']);
    
    // Registration OTP routes (for registration - user doesn't exist yet)
    Route::post('register/otp/request', [OTPAuthController::class, 'requestRegistrationOTP']);
    Route::post('register/otp/verify', [OTPAuthController::class, 'verifyRegistrationOTP']);
    
    // Password reset route (public - uses OTP verification)
    Route::post('reset-password', [OTPAuthController::class, 'resetPassword']);
    
    // Profile update routes (authenticated)
    Route::put('update-profile', [AuthController::class, 'updateProfile']);
    Route::post('update-avatar', [AuthController::class, 'updateAvatar']);
    
    Route::get('mandatory-contribution', function () {
        // Registration fee already paid - no mandatory contribution required
        return response()->json([
            'success' => true,
            'data' => [
                'required' => false,
                'paid' => true,
                'amount' => 0,
                'lastPaymentDate' => now()->toDateTimeString(),
            ]
        ]);
    });
    
    // Also add under /api/v1 for consistency
    Route::get('/v1/mandatory-contribution', function () {
        return response()->json([
            'success' => true,
            'data' => [
                'required' => false,
                'paid' => true,
                'amount' => 0,
                'lastPaymentDate' => now()->toDateTimeString(),
            ]
        ]);
    });
});

// Protected routes (require API key)
Route::middleware(ApiKeyMiddleware::class)
    ->prefix('v1')
    ->group(function () {
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
        Route::apiResource('accounts', AccountController::class); // Includes update (PUT) and destroy (DELETE)
        Route::get('accounts/{account}/transactions', [AccountController::class, 'transactions']);
        Route::post('/create-account', [CreateAccountController::class, '__invoke']);
        Route::post('/accounts/check', CheckAccountController::class)->name('accounts.check');
        Route::post('/accounts/transfer', [AccountController::class, 'transfer']);
        Route::post('/accounts/search', [AccountController::class, 'search']);
        Route::get('/accounts/search', [AccountController::class, 'search']); // Changed to POST in AccountController, will update
        Route::post('/accounts/validate-transfer', [AccountController::class, 'validateTransferAccounts']);
        Route::get('/account-types', [AccountController::class, 'getAccountTypes']);
        Route::get('/account-subtypes', [AccountController::class, 'getAccountSubtypes']);
        
        // Withdrawal Routes (write operations only - reads are public)
        Route::post('/withdrawals/initiate', [WithdrawalController::class, 'initiateWithdrawal'])
            ->name('withdrawals.initiate');
        Route::post('/withdrawals/send-otp', [WithdrawalController::class, 'sendOTP'])
            ->name('withdrawals.sendOTP');
        
        // Transaction routes (account-specific transactions require API key)
        Route::get('accounts/{reference}/transactions', [TransactionController::class, 'getAccountTransactions']);
        Route::get('reports/finance', [ReportController::class, 'finance'])->name('reports.finance');
        Route::post('/uploads', [UploadController::class, 'store'])->name('uploads.store');
        
        Route::post('/airtime/purchase', [AirtimeController::class, 'purchase']);
        Route::get('/airtime/balance', [AirtimeController::class, 'balance']);
        
        // News Management (CRUD)
        Route::post('/news', [\App\Http\Controllers\API\NewsController::class, 'store']);
        Route::put('/news/{id}', [\App\Http\Controllers\API\NewsController::class, 'update']);
        Route::delete('/news/{id}', [\App\Http\Controllers\API\NewsController::class, 'destroy']);
        
        // Announcements
        Route::get('/announcements', [\App\Http\Controllers\API\AnnouncementController::class, 'index']);
        Route::get('/announcements/{id}', [\App\Http\Controllers\API\AnnouncementController::class, 'show']);
        Route::post('/announcements', [\App\Http\Controllers\API\AnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [\App\Http\Controllers\API\AnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [\App\Http\Controllers\API\AnnouncementController::class, 'destroy']);
        Route::put('/announcements/{id}/toggle', [\App\Http\Controllers\API\AnnouncementController::class, 'toggleActive']);
        
        // User Management (Admin)
        Route::get('/users', [\App\Http\Controllers\API\UserController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\API\UserController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\API\UserController::class, 'update']);
        Route::delete('/users/{id}', [\App\Http\Controllers\API\UserController::class, 'destroy']);
        Route::get('/users/{id}/stats', [\App\Http\Controllers\API\UserController::class, 'getStats']);
        Route::put('/users/{id}/password', [\App\Http\Controllers\API\UserController::class, 'updatePassword']);
        Route::put('/users/{id}/toggle-status', [\App\Http\Controllers\API\UserController::class, 'toggleStatus']);
        Route::put('/users/{id}/toggle-role', [\App\Http\Controllers\API\UserController::class, 'toggleRole']);
        Route::post('/users/{id}/reset-password', [\App\Http\Controllers\API\UserController::class, 'resetPassword']);
        Route::put('/users/{id}/permissions', [\App\Http\Controllers\API\UserController::class, 'updatePermissions']);
        Route::post('/users/create-admin', [\App\Http\Controllers\API\UserController::class, 'createAdmin']);
        
        // Orders
        Route::get('/orders', [\App\Http\Controllers\API\OrderController::class, 'getAllOrders']); // Admin
        Route::get('/orders/my', [\App\Http\Controllers\API\OrderController::class, 'index']); // User
        Route::post('/orders', [\App\Http\Controllers\API\OrderController::class, 'store']);
        Route::get('/orders/{id}', [\App\Http\Controllers\API\OrderController::class, 'show']);
        Route::put('/orders/{id}/status', [\App\Http\Controllers\API\OrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/payment', [\App\Http\Controllers\API\OrderController::class, 'updatePaymentStatus']);
        
        // Merchandise
        Route::get('/merchandise', [\App\Http\Controllers\API\MerchandiseController::class, 'index']);
        Route::get('/merchandise/{id}', [\App\Http\Controllers\API\MerchandiseController::class, 'show']);
        Route::post('/merchandise', [\App\Http\Controllers\API\MerchandiseController::class, 'store']);
        Route::put('/merchandise/{id}', [\App\Http\Controllers\API\MerchandiseController::class, 'update']);
        Route::delete('/merchandise/{id}', [\App\Http\Controllers\API\MerchandiseController::class, 'destroy']);
        Route::put('/merchandise/{id}/stock', [\App\Http\Controllers\API\MerchandiseController::class, 'updateStock']);
        
        // Members
        Route::get('/members', [\App\Http\Controllers\API\MemberController::class, 'index']);
        Route::get('/members/mmid/{mmid}', [\App\Http\Controllers\API\MemberController::class, 'getByMMID']);
        Route::post('/members/search', [\App\Http\Controllers\API\MemberController::class, 'search']);
        Route::post('/members', [\App\Http\Controllers\API\MemberController::class, 'store']);
        Route::put('/members/{id}', [\App\Http\Controllers\API\MemberController::class, 'update']);
        Route::get('/members/{id}/stats', [\App\Http\Controllers\API\MemberController::class, 'getStats']);
        
        // ============================================================
        // SEMESTER MANAGEMENT (Admin/Treasurer)
        // ============================================================
        Route::get('/semesters', [SemesterController::class, 'index']);
        Route::post('/semesters', [SemesterController::class, 'store']);
        Route::get('/semesters/{id}', [SemesterController::class, 'show']);
        Route::put('/semesters/{id}', [SemesterController::class, 'update']);
        Route::post('/semesters/{id}/activate', [SemesterController::class, 'activate']);
        Route::get('/semesters/{id}/stats', [SemesterController::class, 'stats']);
        Route::post('/semesters/{id}/send-reminders', [SemesterController::class, 'sendReminders']);
        
        // ============================================================
        // NOTIFICATIONS
        // ============================================================
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/recent', [NotificationController::class, 'recent']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
        Route::post('/notifications/broadcast', [NotificationController::class, 'broadcast']);
        
        // ============================================================
        // ACCOUNT RECHARGE TOKENS
        // ============================================================
        Route::post('/recharge-tokens', [AccountRechargeController::class, 'createToken']);
        Route::get('/recharge-tokens', [AccountRechargeController::class, 'myTokens']);
        Route::post('/recharge-tokens/{id}/cancel', [AccountRechargeController::class, 'cancelToken']);
        Route::get('/recharge-tokens/{id}/contributions', [AccountRechargeController::class, 'getContributions']);
    });

Route::prefix('v1')->group(function () {
    Route::post('/payments/mpesa', [MpesaController::class, 'initiateSTKPush']);
    Route::get('/payments/mpesa/status/{checkoutRequestId}', [MpesaController::class, 'queryTransactionStatus']);
    Route::get('/tickets/completed/all', [TicketController::class, 'getAllCompletedTickets']);

    // Onboarding mandatory payment flow
    Route::post('/onboarding/initiate', [OnboardingController::class, 'initiate']);
    Route::get('/onboarding/status', [OnboardingController::class, 'status']);
    
    // News routes
    Route::get('/news', [\App\Http\Controllers\API\NewsController::class, 'index']);
    Route::get('/news/{id}', [\App\Http\Controllers\API\NewsController::class, 'show']);
    
    // Public Recharge Link (no auth required)
    Route::get('/recharge/{token}', [AccountRechargeController::class, 'getPublicTokenInfo']);
    Route::post('/recharge/{token}/pay', [AccountRechargeController::class, 'initiatePayment']);
    
    // Public Donation to Project (no auth required)
    Route::post('/projects/{id}/public-donate', [ProjectController::class, 'publicDonate']);
    
    // Current Semester (public)
    Route::get('/semesters/current', [SemesterController::class, 'current']);
});

Route::get('/health', function () {
    try {
        // Check database connection safely
        $databaseStatus = 'unknown';
        try {
            if (config('database.default') && config('database.default') !== 'sqlite') {
                DB::connection()->getPdo();
                $databaseStatus = 'connected';
            } else {
                $databaseStatus = 'not_configured';
            }
        } catch (\Exception $e) {
            $databaseStatus = 'disconnected';
        }

        // Check Redis connection safely
        $redisStatus = 'unknown';
        try {
            if (config('cache.default') === 'redis') {
                Cache::store('redis')->put('health_check', 'ok', 1);
                $redisStatus = 'connected';
            } else {
                $redisStatus = 'not_configured';
            }
        } catch (\Exception $e) {
            $redisStatus = 'disconnected';
        }

        // Check queue status safely
        $queueStatus = 'unknown';
        try {
            $queueSize = Queue::size();
            $queueStatus = $queueSize >= 0 ? 'active' : 'inactive';
        } catch (\Exception $e) {
            $queueStatus = 'error';
        }

        return response()->json([
            'status' => 'healthy',
            'timestamp' => now(),
            'services' => [
                'database' => $databaseStatus,
                'redis' => $redisStatus,
                'queue' => $queueStatus
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'timestamp' => now()
        ], 500);
    }
});

// CORS test route
Route::options('/cors-test', function () {
    return response()->json(['message' => 'CORS preflight successful'], 200);
});

Route::get('/cors-test', function () {
    return response()->json([
        'message' => 'CORS is working!',
        'origin' => request()->header('Origin'),
        'timestamp' => now(),
    ]);
});