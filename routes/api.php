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
Route::post('/mpesa/callback', [MpesaController::class, 'handleCallback'])->name('mpesa.callback');
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

Route::middleware(ApiKeyMiddleware::class)
    ->prefix('v1')
    ->group(function () {
        Route::apiResource('projects', ProjectController::class);
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
        
        Route::post('/airtime/purchase', [AirtimeController::class, 'purchase']);
        Route::get('/airtime/balance', [AirtimeController::class, 'balance']);
    });

Route::prefix('v1')->group(function () {
    Route::post('/payments/mpesa', [MpesaController::class, 'initiateSTKPush']);
    Route::get('/payments/mpesa/status/{checkoutRequestId}', [MpesaController::class, 'queryTransactionStatus']);
    Route::get('/tickets/completed/all', [TicketController::class, 'getAllCompletedTickets']);
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'services' => [
            'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
            'redis' => Cache::store('redis')->get('health_check') !== null ? 'connected' : 'disconnected',
            'queue' => Queue::size() >= 0 ? 'active' : 'inactive'
        ]
    ]);
});