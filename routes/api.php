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
use App\Http\Controllers\API\UploadController;
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

// Public routes (no API key required)
Route::prefix('v1')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']); // Public read access
    Route::get('/projects/{id}', [ProjectController::class, 'show']); // Public read access
    
    // Public fallbacks to reduce 404s on frontend (limited data; secure endpoints remain under API key)
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/withdrawals', function () {
        return response()->json(['data' => []]);
    });
    Route::get('/tickets/my', function () {
        return response()->json(['data' => []]);
    });
    Route::get('/accounts/my', function () {
        return response()->json(['data' => []]);
    });
    Route::get('/users', function () {
        return response()->json(['data' => []]);
    });
});

// Simple Auth routes for frontend (public path /api/auth/*)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::get('me', [AuthController::class, 'me']);
    Route::get('mandatory-contribution', function () {
        // Minimal status for frontend gating; adjust to real logic later
        return response()->json([
            'success' => true,
            'data' => [
                'required' => true,
                'paid' => false,
                'amount' => 1,
                'lastPaymentDate' => null,
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
        
        // Withdrawal Routes
        Route::post('/withdrawals/initiate', [WithdrawalController::class, 'initiateWithdrawal'])
            ->name('withdrawals.initiate');
        Route::get('/withdrawals', [WithdrawalController::class, 'getWithdrawals'])
            ->name('withdrawals.list');
        Route::get('/withdrawals/{id}', [WithdrawalController::class, 'getWithdrawal'])
            ->name('withdrawals.show');
        Route::post('/withdrawals/send-otp', [WithdrawalController::class, 'sendOTP'])
            ->name('withdrawals.sendOTP');
        
        Route::get('transactions', [TransactionController::class, 'index']);
        Route::get('transactions/{id}', [TransactionController::class, 'show']);
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
    });

Route::prefix('v1')->group(function () {
    Route::post('/payments/mpesa', [MpesaController::class, 'initiateSTKPush']);
    Route::get('/payments/mpesa/status/{checkoutRequestId}', [MpesaController::class, 'queryTransactionStatus']);
    Route::get('/tickets/completed/all', [TicketController::class, 'getAllCompletedTickets']);
    
    // News routes
    Route::get('/news', [\App\Http\Controllers\API\NewsController::class, 'index']);
    Route::get('/news/{id}', [\App\Http\Controllers\API\NewsController::class, 'show']);
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