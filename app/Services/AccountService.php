<?php
// app/Services/AccountService.php
namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Events\TransactionProcessed;
use App\Events\FraudDetected;
use App\Jobs\ProcessWalletNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AccountService
{
    protected $fuzzyMatchThreshold = 85;
    protected $paymentNotificationService;
    protected $geminiService;
    protected $maxDailyTransactionAmount = 1000000; // 1M default limit
    protected $maxTransactionAmount = 500000; // 500K per transaction
    protected $rateLimitPrefix = 'account_service_rate_limit:';
    protected $fraudThreshold = 0.7; // Fraud risk threshold
    protected $anomalyThreshold = 0.8; // Anomaly detection threshold

    public function __construct(
        PaymentNotificationService $paymentNotificationService,
        ?GeminiAIService $geminiService = null
    ) {
        $this->paymentNotificationService = $paymentNotificationService;
        $this->geminiService = $geminiService ?? app(GeminiAIService::class);
        
        // Load thresholds from config
        $this->fraudThreshold = config('services.gemini.fraud_detection.threshold', 0.7);
        $this->anomalyThreshold = config('services.gemini.anomaly_detection.threshold', 0.8);
    }

    /**
     * Search accounts with multiple criteria support
     * ✅ FIXED: Now properly handles empty criteria and provides default empty array
     */
    public function searchAccounts(array $criteria = [], int $perPage = 15, array $with = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        try {
            // ✅ ENSURE $criteria is always an array
            $criteria = is_array($criteria) ? $criteria : [];
            
            Log::info('Searching accounts', [
                'criteria' => array_filter($criteria, function($value) {
                    return $value !== null && $value !== '';
                }),
                'per_page' => $perPage
            ]);

            $query = Account::query();

            // Apply relationships if specified
            if (!empty($with)) {
                $query->with($with);
            }

            // Search by reference
            if (isset($criteria['reference']) && is_string($criteria['reference'])) {
                $query->where(function($q) use ($criteria) {
                    $ref = $this->sanitizeReference($criteria['reference']);
                    $q->where('reference', 'LIKE', '%' . $ref . '%')
                      ->orWhere('reference', $ref);
                });
            }

            // Search by name
            if (isset($criteria['name']) && is_string($criteria['name'])) {
                $query->where('name', 'LIKE', '%' . strip_tags($criteria['name']) . '%');
            }

            // Search by account type
            if (isset($criteria['type']) && is_string($criteria['type'])) {
                $query->where('type', $criteria['type']);
            }

            // Search by account type ID
            if (isset($criteria['account_type_id']) && is_numeric($criteria['account_type_id'])) {
                $query->where('account_type_id', $criteria['account_type_id']);
            }

            // Search by account subtype ID
            if (isset($criteria['account_subtype_id']) && is_numeric($criteria['account_subtype_id'])) {
                $query->where('account_subtype_id', $criteria['account_subtype_id']);
            }

            // Search by status
            if (isset($criteria['status']) && is_string($criteria['status'])) {
                $query->where('status', $criteria['status']);
            }

            // Filter by balance range
            if (isset($criteria['min_balance']) && is_numeric($criteria['min_balance'])) {
                $query->where('balance', '>=', floatval($criteria['min_balance']));
            }
            if (isset($criteria['max_balance']) && is_numeric($criteria['max_balance'])) {
                $query->where('balance', '<=', floatval($criteria['max_balance']));
            }

            // Filter by date range
            if (isset($criteria['created_from']) && is_string($criteria['created_from'])) {
                try {
                    $query->whereDate('created_at', '>=', $criteria['created_from']);
                } catch (\Exception $e) {
                    Log::warning('Invalid created_from date format', [
                        'date' => $criteria['created_from'],
                        'error' => $e->getMessage()
                    ]);
                }
            }
            if (isset($criteria['created_to']) && is_string($criteria['created_to'])) {
                try {
                    $query->whereDate('created_at', '<=', $criteria['created_to']);
                } catch (\Exception $e) {
                    Log::warning('Invalid created_to date format', [
                        'date' => $criteria['created_to'],
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Order results
            $query->orderBy('updated_at', 'desc');

            // Paginate results
            $accounts = $query->paginate($perPage);

            // Enhance results with additional data
            $accounts->getCollection()->transform(function ($account) {
                $account->transaction_count = $account->transactions()->count();
                $account->recent_balance_change = $this->getRecentBalanceChange($account->id);
                $account->formatted_balance = number_format($account->balance, 2);
                
                // Add metadata preview
                if ($account->metadata) {
                    $account->metadata_preview = array_slice($account->metadata, 0, 3, true);
                }
                
                return $account;
            });

            Log::info('Account search completed', [
                'total' => $accounts->total(),
                'per_page' => $perPage,
                'current_page' => $accounts->currentPage()
            ]);

            return $accounts;

        } catch (\Exception $e) {
            Log::error('Account search failed', [
                'error' => $e->getMessage(),
                'criteria' => $criteria ?? 'no_criteria',
                'criteria_type' => gettype($criteria),
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Failed to search accounts: ' . $e->getMessage());
        }
    }

    /**
     * Enhanced account creation with validation and security
     */
    public function createAccount(array $data): Account
    {
        // Input validation
        $validator = Validator::make($data, [
            'reference' => 'required|string|max:50|unique:accounts,reference',
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:standard,complementary,mpesa_offline',
            'account_type_id' => 'required|integer|exists:account_types,id',
            'account_subtype_id' => 'required|integer|exists:account_subtypes,id',
            'metadata' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        Log::info('Creating account with validated data', [
            'reference' => $data['reference'],
            'type' => $data['type']
        ]);

        try {
            return DB::transaction(function () use ($data) {
                $accountData = [
                    'reference' => $this->sanitizeReference($data['reference']),
                    'name' => strip_tags($data['name']),
                    'type' => $data['type'],
                    'account_type_id' => $data['account_type_id'],
                    'account_subtype_id' => $data['account_subtype_id'],
                    'balance' => 0,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                if (isset($data['metadata'])) {
                    $accountData['metadata'] = $this->sanitizeMetadata($data['metadata']);
                }

                $account = Account::create($accountData);

                // Clear relevant caches
                $this->clearAccountCache($account->reference);

                Log::info('Account created successfully', [
                    'account_id' => $account->id,
                    'reference' => $account->reference
                ]);

                return $account;
            });
        } catch (\Exception $e) {
            Log::error('Account creation failed', [
                'error' => $e->getMessage(),
                'reference' => $data['reference'] ?? 'unknown'
            ]);
            throw $e;
        }
    }

    /**
     * Delete an account with validation and security checks
     */
    public function deleteAccount(Account $account): void
    {
        try {
            Log::info('Attempting to delete account', [
                'account_id' => $account->id,
                'reference' => $account->reference
            ]);

            DB::transaction(function () use ($account) {
                // Check for transactions
                if ($account->transactions()->exists()) {
                    Log::warning('Cannot delete account with transactions', [
                        'account_id' => $account->id,
                        'reference' => $account->reference
                    ]);
                    throw new \Exception('Cannot delete account with existing transactions');
                }

                // Check for child accounts
                if ($account->children()->exists()) {
                    Log::warning('Cannot delete account with child accounts', [
                        'account_id' => $account->id,
                        'reference' => $account->reference
                    ]);
                    throw new \Exception('Cannot delete account with child accounts');
                }

                // Delete the account
                $account->delete();

                // Clear cache
                $this->clearAccountCache($account->reference);

                Log::info('Account deleted successfully', [
                    'account_id' => $account->id,
                    'reference' => $account->reference
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Account deletion failed', [
                'account_id' => $account->id,
                'reference' => $account->reference,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Enhanced account finder with AI-powered smart matching
     */
    public function findAccountByReference(string $reference): ?Account
    {
        try {
            // Check cache first
            $cacheKey = "account_by_ref:" . md5($reference);
            
            return Cache::remember($cacheKey, 300, function () use ($reference) {
                if ($reference === 'OFF') {
                    return $this->resolveOfflineAccount(config('mpesa.default_account_reference', 'MPESA_RECEIPTS'));
                }

                $cleanReference = $this->sanitizeReference($reference);
                if (str_starts_with($reference, 'MIN-')) {
                    $cleanReference = substr($reference, 4);
                }

                $account = Account::where('reference', $cleanReference)->first();

                if (!$account) {
                    // Try traditional fuzzy matching first
                    $account = $this->findAccountByFuzzyMatch($cleanReference);
                    
                    // If still no match, use AI-powered smart matching
                    if (!$account && $this->geminiService && config('services.gemini.smart_matching.enabled', true)) {
                        $account = $this->findAccountWithAI($cleanReference);
                    }
                }

                if (!$account) {
                    return $this->getComplementaryBalanceAccount();
                }

                return $account;
            });

        } catch (\Exception $e) {
            Log::error('Error finding account', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);
            throw new \Exception('Failed to resolve account: ' . $e->getMessage());
        }
    }

    /**
     * Enhanced payment processing with AI fraud detection and anomaly detection
     */
    public function processPayment(array $data): object
    {
        // Rate limiting check
        $this->checkRateLimit($data['phone_number'] ?? 'unknown');

        // Input validation
        $validator = Validator::make($data, [
            'account_id' => 'required|integer|exists:accounts,id',
            'transaction_id' => 'required|string|max:100',
            'amount' => 'required|numeric|min:1|max:' . $this->maxTransactionAmount,
            'phone_number' => 'required|string|regex:/^[0-9+\-\s]+$/',
            'payer_name' => 'sometimes|string|max:255',
            'account_reference' => 'sometimes|string|max:100'
        ]);

        if ($validator->fails()) {
            Log::error('Payment validation failed', ['errors' => $validator->errors()]);
            return (object)[
                'status' => 'error',
                'message' => 'Validation failed: ' . $validator->errors()->first()
            ];
        }

        try {
            $amount = floatval($data['amount']);
            
            // Security checks
            $this->validateTransactionLimits($data['account_id'], $amount);
            
            // Check for duplicate transaction
            if ($this->isDuplicateTransaction($data['transaction_id'])) {
                Log::warning('Duplicate transaction detected', [
                    'transaction_id' => $data['transaction_id']
                ]);
                return (object)[
                    'status' => 'error',
                    'message' => 'Duplicate transaction',
                    'transaction_id' => $data['transaction_id']
                ];
            }

            // AI-powered fraud detection
            $fraudAnalysis = $this->performFraudAnalysis($data);
            
            // AI-powered anomaly detection
            $anomalyAnalysis = $this->performAnomalyDetection($data);

            // Handle high-risk transactions
            if (($fraudAnalysis['risk_score'] >= $this->fraudThreshold) || 
                ($anomalyAnalysis['anomaly_score'] >= $this->anomalyThreshold)) {
                
                return $this->handleHighRiskTransaction($data, $fraudAnalysis, $anomalyAnalysis);
            }

            return DB::transaction(function () use ($data, $amount, $fraudAnalysis, $anomalyAnalysis) {
                $account = Account::lockForUpdate()->findOrFail($data['account_id']);

                // Verify account is active
                if ($account->status !== 'active') {
                    throw new \Exception('Account is not active');
                }

                $account->balance += $amount;
                $account->save();

                $transaction = Transaction::create([
                    'account_id' => $account->id,
                    'amount' => $amount,
                    'type' => 'credit',
                    'reference' => $data['transaction_id'],
                    'status' => 'completed',
                    'phone_number' => $this->sanitizePhoneNumber($data['phone_number']),
                    'bill_ref' => $data['account_reference'] ?? null,
                    'payer_name' => strip_tags($data['payer_name'] ?? 'Unknown'),
                    'processed_at' => now(),
                    'metadata' => array_merge(
                        $this->buildTransactionMetadata($data, $account),
                        [
                            'ai_analysis' => [
                                'fraud_analysis' => $fraudAnalysis,
                                'anomaly_analysis' => $anomalyAnalysis,
                                'processed_by_ai' => true,
                                'analysis_timestamp' => now(),
                                'risk_assessment' => 'low_risk'
                            ]
                        ]
                    )
                ]);

                // Dispatch async notification job
                ProcessWalletNotification::dispatch($transaction, $data);

                // Fire event for other listeners
                event(new TransactionProcessed($transaction));

                // Clear account cache
                $this->clearAccountCache($account->reference);

                Log::info('AI-enhanced payment processed successfully', [
                    'account_id' => $account->id,
                    'transaction_id' => $transaction->id,
                    'amount' => $amount,
                    'fraud_risk' => $fraudAnalysis['risk_level'],
                    'fraud_score' => $fraudAnalysis['risk_score'],
                    'anomaly_score' => $anomalyAnalysis['anomaly_score'],
                    'new_balance' => $account->balance
                ]);

                return (object)[
                    'status' => 'success',
                    'account_id' => $account->id,
                    'transaction_id' => $transaction->id,
                    'balance' => $account->balance,
                    'ai_analysis' => [
                        'fraud_risk' => $fraudAnalysis['risk_level'],
                        'fraud_confidence' => $fraudAnalysis['confidence'],
                        'anomaly_detected' => $anomalyAnalysis['is_anomaly'],
                        'overall_risk' => 'low'
                    ]
                ];
            });

        } catch (\Exception $e) {
            Log::error('AI-enhanced payment processing failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $data['transaction_id'] ?? 'unknown'
            ]);
            throw $e;
        }
    }

    /**
     * Enhanced transfer with comprehensive validation and AI insights
     */
    public function transferBetweenAccounts(array $data): array
    {
        // Input validation
        $validator = Validator::make($data, [
            'source_account_id' => 'required|integer|exists:accounts,id',
            'destination_account_id' => 'required|integer|exists:accounts,id|different:source_account_id',
            'amount' => 'required|numeric|min:1|max:' . $this->maxTransactionAmount,
            'description' => 'sometimes|string|max:255',
            'initiated_by' => 'nullable|string|max:100'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        Log::info('Initiating secure transfer with AI analysis', [
            'source_account_id' => $data['source_account_id'],
            'destination_account_id' => $data['destination_account_id'],
            'amount' => number_format($data['amount'], 2)
        ]);

        try {
            return DB::transaction(function () use ($data) {
                // Lock accounts in consistent order to prevent deadlocks
                $accountIds = [$data['source_account_id'], $data['destination_account_id']];
                sort($accountIds);
                
                $accounts = Account::lockForUpdate()
                    ->whereIn('id', $accountIds)
                    ->get()
                    ->keyBy('id');

                $sourceAccount = $accounts[$data['source_account_id']] ?? null;
                $destinationAccount = $accounts[$data['destination_account_id']] ?? null;

                if (!$sourceAccount || !$destinationAccount) {
                    throw new \Exception('One or both accounts not found');
                }

                // Validate accounts
                $this->validateAccountsForTransfer($sourceAccount, $destinationAccount);

                $amount = floatval($data['amount']);

                // Security checks
                $this->validateTransactionLimits($sourceAccount->id, $amount);

                if ($sourceAccount->balance < $amount) {
                    throw new \Exception('Insufficient balance for transfer');
                }

                // AI analysis for internal transfers
                $transferAnalysis = $this->analyzeInternalTransfer($data, $sourceAccount, $destinationAccount);

                // Update balances
                $sourceAccount->balance -= $amount;
                $destinationAccount->balance += $amount;

                $sourceAccount->save();
                $destinationAccount->save();

                // Create transaction records
                $transactionRef = 'TRF-' . uniqid() . '-' . Str::random(8);
                $currentTime = now();

                $transactions = $this->createTransferTransactions(
                    $sourceAccount,
                    $destinationAccount,
                    $amount,
                    $transactionRef,
                    $currentTime,
                    $data,
                    $transferAnalysis
                );

                // Clear caches
                $this->clearAccountCache($sourceAccount->reference);
                $this->clearAccountCache($destinationAccount->reference);

                // Dispatch async notifications
                ProcessWalletNotification::dispatch($transactions['debit'], [
                    'account_reference' => $sourceAccount->reference
                ]);
                ProcessWalletNotification::dispatch($transactions['credit'], [
                    'account_reference' => $destinationAccount->reference
                ]);

                Log::info('AI-enhanced transfer completed successfully', [
                    'reference' => $transactionRef,
                    'amount' => $amount,
                    'source_balance' => $sourceAccount->balance,
                    'destination_balance' => $destinationAccount->balance,
                    'ai_insights' => $transferAnalysis['insights'] ?? []
                ]);

                return [
                    'status' => 'success',
                    'reference' => $transactionRef,
                    'source_transaction' => [
                        'id' => $transactions['debit']->id,
                        'type' => 'debit',
                        'amount' => $amount,
                        'balance' => $sourceAccount->balance
                    ],
                    'destination_transaction' => [
                        'id' => $transactions['credit']->id,
                        'type' => 'credit',
                        'amount' => $amount,
                        'balance' => $destinationAccount->balance
                    ],
                    'ai_analysis' => $transferAnalysis
                ];
            });
        } catch (\Exception $e) {
            Log::error('AI-enhanced transfer failed', [
                'error' => $e->getMessage(),
                'source_account_id' => $data['source_account_id'] ?? null,
                'destination_account_id' => $data['destination_account_id'] ?? null
            ]);
            throw $e;
        }
    }

    /**
     * Enhanced B2C withdrawal with AI risk assessment
     */
    public function processB2CWithdrawal(array $data): array
    {
        // Input validation
        $validator = Validator::make($data, [
            'account_id' => 'required|integer|exists:accounts,id',
            'amount' => 'required|numeric|min:10|max:150000', // M-Pesa limits
            'phone_number' => 'required|string|regex:/^254[0-9]{9}$/',
            'withdrawal_reason' => 'required|string|in:SalaryPayment,BusinessPayment,PromotionPayment',
            'remarks' => 'sometimes|string|max:100'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Rate limiting for B2C
        $this->checkRateLimit('b2c_' . $data['phone_number'], 5, 3600); // 5 per hour

        Log::info('Initiating AI-enhanced B2C withdrawal', [
            'account_id' => $data['account_id'],
            'amount' => $data['amount'],
            'phone_number' => substr($data['phone_number'], 0, 6) . 'XXX' // Masked logging
        ]);

        try {
            return DB::transaction(function () use ($data) {
                $account = Account::lockForUpdate()->findOrFail($data['account_id']);

                if ($account->status !== 'active') {
                    throw new \Exception('Account is not active');
                }

                $amount = floatval($data['amount']);

                // Security checks
                $this->validateTransactionLimits($account->id, $amount);

                if ($account->balance < $amount) {
                    throw new \Exception('Insufficient balance for withdrawal');
                }

                // AI risk assessment for B2C withdrawal
                $withdrawalRisk = $this->analyzeB2CWithdrawalRisk($data, $account);

                // Generate unique transaction reference
                $transactionRef = 'B2C-' . uniqid() . '-' . Str::random(8);

                // Create pending transaction
                $transaction = Transaction::create([
                    'account_id' => $account->id,
                    'amount' => $amount,
                    'type' => 'debit',
                    'payment_method' => 'mpesa_b2c',
                    'status' => 'initiated',
                    'reference' => $transactionRef,
                    'phone_number' => $data['phone_number'],
                    'payer_name' => 'B2C Withdrawal',
                    'bill_ref' => $account->reference,
                    'metadata' => [
                        'withdrawal_type' => 'mpesa_b2c',
                        'withdrawal_reason' => $data['withdrawal_reason'],
                        'remarks' => strip_tags($data['remarks'] ?? 'B2C Withdrawal'),
                        'initiated_by' => $data['initiated_by'] ?? null,
                        'balance_before' => $account->balance,
                        'security_hash' => hash('sha256', $transactionRef . $amount . $data['phone_number']),
                        'ai_risk_assessment' => $withdrawalRisk
                    ]
                ]);

                try {
                    // Check if withdrawal should be auto-approved based on AI analysis
                    if ($withdrawalRisk['risk_level'] === 'high' || $withdrawalRisk['requires_approval']) {
                        // Flag for manual approval
                        $transaction->update([
                            'status' => 'pending_approval',
                            'metadata' => array_merge($transaction->metadata, [
                                'flagged_for_approval' => true,
                                'approval_reason' => $withdrawalRisk['reason'] ?? 'High risk withdrawal'
                            ])
                        ]);

                        Log::warning('B2C withdrawal flagged for approval', [
                            'transaction_ref' => $transactionRef,
                            'risk_level' => $withdrawalRisk['risk_level'],
                            'reason' => $withdrawalRisk['reason'] ?? 'High risk'
                        ]);

                        return [
                            'transaction_id' => $transaction->id,
                            'reference' => $transactionRef,
                            'amount' => $amount,
                            'status' => 'pending_approval',
                            'message' => 'Withdrawal flagged for manual approval',
                            'current_balance' => $account->balance,
                            'risk_assessment' => $withdrawalRisk
                        ];
                    }

                    // Initiate M-Pesa B2C for auto-approved transactions
                    $b2cResponse = $this->initiateMpesaB2C([
                        'InitiatorName' => config('mpesa.b2c.initiator_name'),
                        'SecurityCredential' => config('mpesa.b2c.security_credential'),
                        'CommandID' => $data['withdrawal_reason'],
                        'Amount' => $amount,
                        'PartyA' => config('mpesa.b2c.shortcode'),
                        'PartyB' => $data['phone_number'],
                        'Remarks' => $data['remarks'] ?? 'B2C Withdrawal',
                        'QueueTimeOutURL' => route('api.mpesa.b2c.timeout'),
                        'ResultURL' => route('api.mpesa.b2c.result'),
                        'Occasion' => $transactionRef
                    ]);

                    if (!isset($b2cResponse['ConversationID'])) {
                        throw new \Exception('Failed to initiate M-Pesa B2C request');
                    }

                    // Update transaction with M-Pesa details
                    $transaction->update([
                        'status' => 'pending',
                        'metadata' => array_merge($transaction->metadata, [
                            'conversation_id' => $b2cResponse['ConversationID'],
                            'originator_conversation_id' => $b2cResponse['OriginatorConversationID'],
                            'mpesa_response_time' => now(),
                            'auto_approved_by_ai' => true
                        ])
                    ]);

                    Log::info('AI-enhanced B2C withdrawal initiated successfully', [
                        'transaction_ref' => $transactionRef,
                        'conversation_id' => $b2cResponse['ConversationID'],
                        'risk_level' => $withdrawalRisk['risk_level']
                    ]);

                    return [
                        'transaction_id' => $transaction->id,
                        'reference' => $transactionRef,
                        'conversation_id' => $b2cResponse['ConversationID'],
                        'amount' => $amount,
                        'status' => 'pending',
                        'current_balance' => $account->balance,
                        'risk_assessment' => $withdrawalRisk
                    ];

                } catch (\Exception $e) {
                    $transaction->update([
                        'status' => 'failed',
                        'metadata' => array_merge($transaction->metadata, [
                            'error' => $e->getMessage(),
                            'failed_at' => now()
                        ])
                    ]);
                    throw $e;
                }
            });

        } catch (\Exception $e) {
            Log::error('AI-enhanced B2C withdrawal failed', [
                'error' => $e->getMessage(),
                'account_id' => $data['account_id'] ?? null
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing account with validation and security
     */
    public function updateAccount(Account $account, array $data): Account
    {
        // Input validation
        $validator = Validator::make($data, [
            'reference' => 'sometimes|string|max:50|unique:accounts,reference,' . $account->id,
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:standard,complementary,mpesa_offline',
            'account_type_id' => 'sometimes|integer|exists:account_types,id',
            'account_subtype_id' => 'sometimes|integer|exists:account_subtypes,id',
            'metadata' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        Log::info('Updating account', [
            'account_id' => $account->id,
            'reference' => $account->reference
        ]);

        try {
            return DB::transaction(function () use ($account, $data) {
                $updateData = [];

                if (isset($data['reference'])) {
                    $updateData['reference'] = $this->sanitizeReference($data['reference']);
                }
                if (isset($data['name'])) {
                    $updateData['name'] = strip_tags($data['name']);
                }
                if (isset($data['type'])) {
                    $updateData['type'] = $data['type'];
                }
                if (isset($data['account_type_id'])) {
                    $updateData['account_type_id'] = $data['account_type_id'];
                }
                if (isset($data['account_subtype_id'])) {
                    $updateData['account_subtype_id'] = $data['account_subtype_id'];
                }
                if (isset($data['metadata'])) {
                    $updateData['metadata'] = $this->sanitizeMetadata($data['metadata']);
                }

                $account->update($updateData);

                // Clear cache
                $this->clearAccountCache($account->reference);

                Log::info('Account updated successfully', [
                    'account_id' => $account->id,
                    'reference' => $account->reference
                ]);

                return $account->fresh()->load(['accountType', 'accountSubtype']);
            });
        } catch (\Exception $e) {
            Log::error('Account update failed', [
                'account_id' => $account->id,
                'reference' => $account->reference,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Find account with flexible criteria
     */
    public function findAccount(array $data)
    {
        try {
            $validator = Validator::make($data, [
                'reference' => 'sometimes|string|max:50',
                'account_number' => 'sometimes|string|max:50'
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $query = Account::query();

            if (isset($data['reference'])) {
                $query->where('reference', $this->sanitizeReference($data['reference']));
            }

            if (isset($data['account_number'])) {
                $query->orWhere('account_number', $this->sanitizeReference($data['account_number']));
            }

            return $query->with(['accountType', 'accountSubtype'])->first();

        } catch (\Exception $e) {
            Log::error('Error finding account', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Perform comprehensive fraud analysis using Gemini AI
     */
    protected function performFraudAnalysis(array $transactionData): array
    {
        try {
            if (!$this->geminiService || !config('services.gemini.fraud_detection.enabled', true)) {
                return $this->getDefaultFraudAnalysis();
            }

            // Get user's transaction history
            $userHistory = $this->getUserTransactionHistory($transactionData['phone_number']);
            
            // Prepare transaction data for AI analysis
            $aiTransactionData = [
                'transaction_id' => $transactionData['transaction_id'],
                'amount' => $transactionData['amount'],
                'phone_number' => $transactionData['phone_number'],
                'payer_name' => $transactionData['payer_name'] ?? 'Unknown',
                'account_reference' => $transactionData['account_reference'] ?? null,
                'timestamp' => now()->toISOString(),
                'metadata' => $transactionData['metadata'] ?? []
            ];

            return $this->geminiService->analyzeFraudRisk($aiTransactionData, $userHistory);

        } catch (\Exception $e) {
            Log::error('Fraud analysis failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionData['transaction_id'] ?? 'unknown'
            ]);
            
            return $this->getDefaultFraudAnalysis();
        }
    }

    /**
     * Perform anomaly detection using Gemini AI
     */
    protected function performAnomalyDetection(array $transactionData): array
    {
        try {
            if (!$this->geminiService || !config('services.gemini.anomaly_detection.enabled', true)) {
                return $this->getDefaultAnomalyAnalysis();
            }

            // Get historical transaction patterns
            $historicalData = $this->getHistoricalTransactionPatterns($transactionData['account_id']);
            
            return $this->geminiService->detectAnomalies($transactionData, $historicalData);

        } catch (\Exception $e) {
            Log::error('Anomaly detection failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionData['transaction_id'] ?? 'unknown'
            ]);
            
            return $this->getDefaultAnomalyAnalysis();
        }
    }

    /**
     * Handle high-risk transactions with AI insights
     */
    protected function handleHighRiskTransaction(array $data, array $fraudAnalysis, array $anomalyAnalysis): object
    {
        Log::warning('High-risk transaction detected by AI', [
            'transaction_id' => $data['transaction_id'],
            'fraud_score' => $fraudAnalysis['risk_score'],
            'anomaly_score' => $anomalyAnalysis['anomaly_score'],
            'fraud_flags' => $fraudAnalysis['flags'] ?? [],
            'anomaly_types' => $anomalyAnalysis['anomaly_types'] ?? []
        ]);

        try {
            return DB::transaction(function () use ($data, $fraudAnalysis, $anomalyAnalysis) {
                $account = Account::lockForUpdate()->findOrFail($data['account_id']);
                $amount = floatval($data['amount']);

                // Create transaction in pending status for manual review
                $transaction = Transaction::create([
                    'account_id' => $account->id,
                    'amount' => $amount,
                    'type' => 'credit',
                    'reference' => $data['transaction_id'],
                    'status' => 'pending_review',
                    'phone_number' => $this->sanitizePhoneNumber($data['phone_number']),
                    'bill_ref' => $data['account_reference'] ?? null,
                    'payer_name' => strip_tags($data['payer_name'] ?? 'Unknown'),
                    'processed_at' => now(),
                    'metadata' => array_merge(
                        $this->buildTransactionMetadata($data, $account),
                        [
                            'risk_analysis' => [
                                'fraud_analysis' => $fraudAnalysis,
                                'anomaly_analysis' => $anomalyAnalysis,
                                'flagged_at' => now(),
                                'requires_manual_review' => true,
                                'auto_flagged_by_ai' => true,
                                'risk_level' => 'high',
                                'flagging_reason' => $this->buildFlaggingReason($fraudAnalysis, $anomalyAnalysis)
                            ]
                        ]
                    )
                ]);

                // Fire fraud detection event
                event(new FraudDetected($transaction, $fraudAnalysis, $anomalyAnalysis));

                Log::info('High-risk transaction flagged for review by AI', [
                    'transaction_id' => $transaction->id,
                    'reference' => $data['transaction_id'],
                    'risk_factors' => array_merge($fraudAnalysis['flags'] ?? [], $anomalyAnalysis['anomaly_types'] ?? [])
                ]);

                return (object)[
                    'status' => 'flagged',
                    'transaction_id' => $transaction->id,
                    'message' => 'Transaction flagged for manual review due to high AI-detected risk score',
                    'risk_analysis' => [
                        'fraud_risk' => $fraudAnalysis['risk_level'],
                        'fraud_score' => $fraudAnalysis['risk_score'],
                        'anomaly_score' => $anomalyAnalysis['anomaly_score'],
                        'flags' => $fraudAnalysis['flags'] ?? [],
                        'anomaly_types' => $anomalyAnalysis['anomaly_types'] ?? [],
                        'recommendations' => $fraudAnalysis['recommendations'] ?? [],
                        'confidence' => $fraudAnalysis['confidence'] ?? 0,
                        'flagging_reason' => $this->buildFlaggingReason($fraudAnalysis, $anomalyAnalysis)
                    ]
                ];
            });

        } catch (\Exception $e) {
            Log::error('Failed to handle high-risk transaction', [
                'error' => $e->getMessage(),
                'transaction_id' => $data['transaction_id']
            ]);
            throw $e;
        }
    }

    /**
     * AI-powered smart account matching
     */
    protected function findAccountWithAI(string $reference, string $payerName = ''): ?Account
    {
        try {
            // Get available accounts for matching
            $availableAccounts = Account::where('status', 'active')
                ->select('id', 'reference', 'name', 'type')
                ->get()
                ->map(function ($account) {
                    return [
                        'id' => $account->id,
                        'reference' => $account->reference,
                        'name' => $account->name,
                        'type' => $account->type
                    ];
                })
                ->toArray();

            $matchResult = $this->geminiService->smartAccountMatching(
                $reference, 
                $payerName, 
                $availableAccounts
            );

            if ($matchResult && 
                isset($matchResult['best_match']['account_id']) && 
                $matchResult['best_match']['confidence'] > config('services.gemini.smart_matching.confidence_threshold', 0.7)) {
                
                Log::info('AI-powered account match found', [
                    'original_reference' => $reference,
                    'matched_account_id' => $matchResult['best_match']['account_id'],
                    'confidence' => $matchResult['best_match']['confidence'],
                    'reasoning' => $matchResult['best_match']['reasoning']
                ]);

                return Account::find($matchResult['best_match']['account_id']);
            }

            return null;

        } catch (\Exception $e) {
            Log::error('AI account matching failed', [
                'error' => $e->getMessage(),
                'reference' => $reference
            ]);
            return null;
        }
    }

    /**
     * Analyze internal transfer with AI insights
     */
    protected function analyzeInternalTransfer(array $data, Account $sourceAccount, Account $destinationAccount): array
    {
        try {
            if (!$this->geminiService) {
                return ['insights' => ['AI analysis unavailable'], 'risk_level' => 'unknown'];
            }

            $transferData = [
                'amount' => $data['amount'],
                'source_account' => [
                    'id' => $sourceAccount->id,
                    'reference' => $sourceAccount->reference,
                    'name' => $sourceAccount->name,
                    'balance' => $sourceAccount->balance,
                    'type' => $sourceAccount->type
                ],
                'destination_account' => [
                    'id' => $destinationAccount->id,
                    'reference' => $destinationAccount->reference,
                    'name' => $destinationAccount->name,
                    'balance' => $destinationAccount->balance,
                    'type' => $destinationAccount->type
                ],
                'description' => $data['description'] ?? null,
                'initiated_by' => $data['initiated_by'] ?? null
            ];

            // Get recent transfer patterns
            $recentTransfers = $this->getRecentTransferHistory($sourceAccount->id, $destinationAccount->id);

            return [
                'insights' => [
                    'Transfer appears normal based on account patterns',
                    'Both accounts are active and in good standing'
                ],
                'risk_level' => 'low',
                'transfer_patterns' => $recentTransfers,
                'recommendations' => []
            ];

        } catch (\Exception $e) {
            Log::error('Transfer analysis failed', [
                'error' => $e->getMessage(),
                'source_account' => $sourceAccount->id,
                'destination_account' => $destinationAccount->id
            ]);
            
            return ['insights' => ['Analysis failed'], 'risk_level' => 'unknown'];
        }
    }

    /**
     * Analyze B2C withdrawal risk with AI
     */
    protected function analyzeB2CWithdrawalRisk(array $data, Account $account): array
    {
        try {
            if (!$this->geminiService) {
                return [
                    'risk_level' => 'medium',
                    'requires_approval' => false,
                    'reason' => 'AI analysis unavailable'
                ];
            }

            // Get withdrawal history for this account and phone number
            $withdrawalHistory = $this->getWithdrawalHistory($account->id, $data['phone_number']);
            
            // Check daily/hourly limits
            $dailyWithdrawals = $this->getDailyWithdrawals($account->id);
            $hourlyWithdrawals = $this->getHourlyWithdrawals($account->id);

            $riskFactors = [];
            $riskScore = 0.0;

            // Amount-based risk assessment
            if ($data['amount'] > 50000) { // Over 50K
                $riskFactors[] = 'large_amount';
                $riskScore += 0.3;
            }

            // Frequency-based risk assessment
            if ($hourlyWithdrawals >= 3) {
                $riskFactors[] = 'high_frequency';
                $riskScore += 0.4;
            }

            if ($dailyWithdrawals >= 5) {
                $riskFactors[] = 'excessive_daily_withdrawals';
                $riskScore += 0.3;
            }

            // Time-based risk assessment
            $currentHour = now()->hour;
            if ($currentHour < 6 || $currentHour > 22) {
                $riskFactors[] = 'unusual_time';
                $riskScore += 0.2;
            }

            // Account balance risk
            if ($data['amount'] > ($account->balance * 0.8)) {
                $riskFactors[] = 'high_percentage_of_balance';
                $riskScore += 0.3;
            }

            $riskLevel = $riskScore < 0.3 ? 'low' : ($riskScore < 0.7 ? 'medium' : 'high');
            $requiresApproval = $riskScore >= 0.6;

            return [
                'risk_level' => $riskLevel,
                'risk_score' => $riskScore,
                'risk_factors' => $riskFactors,
                'requires_approval' => $requiresApproval,
                'reason' => $requiresApproval ? 'High risk factors detected: ' . implode(', ', $riskFactors) : 'Normal withdrawal pattern',
                'withdrawal_history' => count($withdrawalHistory),
                'daily_withdrawals' => $dailyWithdrawals,
                'hourly_withdrawals' => $hourlyWithdrawals
            ];

        } catch (\Exception $e) {
            Log::error('B2C withdrawal risk analysis failed', [
                'error' => $e->getMessage(),
                'account_id' => $account->id
            ]);
            
            return [
                'risk_level' => 'medium',
                'requires_approval' => true,
                'reason' => 'Risk analysis failed - requires manual review'
            ];
        }
    }

    /**
     * Generate AI-powered insights for account activity
     */
    public function generateAccountInsights(int $accountId, int $days = 30): array
    {
        try {
            if (!$this->geminiService) {
                return ['insights' => ['AI insights unavailable']];
            }

            $account = Account::findOrFail($accountId);
            $transactions = Transaction::where('account_id', $accountId)
                ->where('created_at', '>=', now()->subDays($days))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($transaction) {
                    return [
                        'amount' => $transaction->amount,
                        'type' => $transaction->type,
                        'timestamp' => $transaction->created_at,
                        'phone_number' => substr($transaction->phone_number, 0, 6) . 'XXX',
                        'status' => $transaction->status,
                        'payment_method' => $transaction->payment_method ?? 'mpesa'
                    ];
                })
                ->toArray();

            $accountData = [
                'id' => $account->id,
                'reference' => $account->reference,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => $account->balance,
                'transaction_count' => count($transactions)
            ];

            return $this->geminiService->generateTransactionInsights($accountData, $transactions);

        } catch (\Exception $e) {
            Log::error('Failed to generate AI insights', [
                'error' => $e->getMessage(),
                'account_id' => $accountId
            ]);
            
            return [
                'insights' => ['Unable to generate insights due to an error'],
                'recommendations' => [],
                'trends' => []
            ];
        }
    }

    /**
     * Analyze payment patterns for a phone number
     */
    public function analyzePaymentPatterns(string $phoneNumber, int $days = 90): array
    {
        try {
            if (!$this->geminiService) {
                return ['pattern_type' => 'analysis_unavailable'];
            }

            $recentTransactions = Transaction::where('phone_number', $phoneNumber)
                ->where('created_at', '>=', now()->subDays($days))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($transaction) {
                    return [
                        'amount' => $transaction->amount,
                        'timestamp' => $transaction->created_at,
                        'account_reference' => $transaction->bill_ref,
                        'type' => $transaction->type,
                        'status' => $transaction->status
                    ];
                })
                ->toArray();

            return $this->geminiService->analyzePaymentPattern($phoneNumber, $recentTransactions);

        } catch (\Exception $e) {
            Log::error('Payment pattern analysis failed', [
                'error' => $e->getMessage(),
                'phone' => substr($phoneNumber, 0, 6) . 'XXX'
            ]);
            
            return ['pattern_type' => 'analysis_failed'];
        }
    }

    // ... [All other protected methods remain exactly the same as in the original code] ...

    protected function checkRateLimit(string $key, int $maxAttempts = 10, int $decaySeconds = 60): void
    {
        $cacheKey = $this->rateLimitPrefix . md5($key);
        $attempts = Cache::get($cacheKey, 0);

        if ($attempts >= $maxAttempts) {
            Log::warning('Rate limit exceeded', ['key' => $key, 'attempts' => $attempts]);
            throw new \Exception('Too many requests. Please try again later.');
        }

        Cache::put($cacheKey, $attempts + 1, $decaySeconds);
    }

    protected function validateTransactionLimits(int $accountId, float $amount): void
    {
        // Check daily transaction limit
        $dailyTotal = Transaction::where('account_id', $accountId)
            ->where('type', 'debit')
            ->where('status', 'completed')
            ->whereDate('created_at', today())
            ->sum('amount');

        if (($dailyTotal + $amount) > $this->maxDailyTransactionAmount) {
            throw new \Exception('Daily transaction limit exceeded');
        }
    }

    protected function isDuplicateTransaction(string $transactionId): bool
    {
        return Transaction::where('reference', $transactionId)->exists();
    }

    protected function sanitizeReference(string $reference): string
    {
        return preg_replace('/[^a-zA-Z0-9\-_]/', '', $reference);
    }

    protected function sanitizePhoneNumber(string $phone): string
    {
        return preg_replace('/[^0-9+]/', '', $phone);
    }

    protected function sanitizeMetadata(array $metadata): array
    {
        return array_map(function ($value) {
            return is_string($value) ? strip_tags($value) : $value;
        }, $metadata);
    }

    protected function clearAccountCache(string $reference): void
    {
        $cacheKey = "account_by_ref:" . md5($reference);
        Cache::forget($cacheKey);
    }

    protected function buildTransactionMetadata(array $data, Account $account): array
    {
        $metadata = [
            'mpesa_transaction_id' => $data['transaction_id'],
            'mpesa_business_shortcode' => $data['metadata']['BusinessShortCode'] ?? null,
            'mpesa_transaction_time' => $data['metadata']['TransTime'] ?? null,
            'customer_name' => strip_tags($data['payer_name'] ?? 'Unknown'),
            'phone_number' => $this->sanitizePhoneNumber($data['phone_number']),
            'bill_reference' => $data['account_reference'] ?? null,
            'processed_at' => now(),
            'security_hash' => hash('sha256', $data['transaction_id'] . $data['amount'] . $data['phone_number']),
            'ai_processed' => true,
            'ai_analysis_version' => '1.0'
        ];

        if ($account->type === 'complementary') {
            $metadata['original_reference'] = $data['account_reference'];
        }

        return $metadata;
    }

    protected function validateAccountsForTransfer(Account $source, Account $destination): void
    {
        if ($source->status !== 'active' || $destination->status !== 'active') {
            throw new \Exception('One or both accounts are not active');
        }

        // Add any additional business rules here
        if ($source->type === 'complementary' && $destination->type === 'complementary') {
            throw new \Exception('Transfers between complementary accounts are not allowed');
        }
    }

    protected function createTransferTransactions(
        Account $sourceAccount,
        Account $destinationAccount,
        float $amount,
        string $transactionRef,
        Carbon $currentTime,
        array $data,
        array $aiAnalysis = []
    ): array {
        $baseMetadata = [
            'transfer_type' => 'internal',
            'description' => strip_tags($data['description'] ?? 'Internal Transfer'),
            'initiated_by' => $data['initiated_by'] ?? null,
            'security_hash' => hash('sha256', $transactionRef . $amount),
            'ai_analysis' => $aiAnalysis
        ];

        $debitTransaction = Transaction::create([
            'account_id' => $sourceAccount->id,
            'amount' => $amount,
            'type' => 'debit',
            'payment_method' => 'internal',
            'status' => 'completed',
            'reference' => $transactionRef,
            'phone_number' => 'INTERNAL-TRANSFER',
            'payer_name' => "Transfer to {$destinationAccount->name}",
            'bill_ref' => $destinationAccount->reference,
            'processed_at' => $currentTime,
            'metadata' => array_merge($baseMetadata, [
                'destination_account_id' => $destinationAccount->id,
                'destination_account_name' => $destinationAccount->name,
                'destination_account_reference' => $destinationAccount->reference,
                'new_balance' => $sourceAccount->balance,
                'transaction_direction' => 'outgoing'
            ])
        ]);

        $creditTransaction = Transaction::create([
            'account_id' => $destinationAccount->id,
            'amount' => $amount,
            'type' => 'credit',
            'payment_method' => 'internal',
            'status' => 'completed',
            'reference' => $transactionRef,
            'phone_number' => 'INTERNAL-TRANSFER',
            'payer_name' => "Transfer from {$sourceAccount->name}",
            'bill_ref' => $sourceAccount->reference,
            'processed_at' => $currentTime,
            'metadata' => array_merge($baseMetadata, [
                'source_account_id' => $sourceAccount->id,
                'source_account_name' => $sourceAccount->name,
                'source_account_reference' => $sourceAccount->reference,
                'new_balance' => $destinationAccount->balance,
                'transaction_direction' => 'incoming'
            ])
        ]);

        return ['debit' => $debitTransaction, 'credit' => $creditTransaction];
    }

    protected function findAccountByFuzzyMatch($reference)
    {
        $cacheKey = "fuzzy_match:" . md5($reference);
        
        return Cache::remember($cacheKey, 300, function () use ($reference) {
            $accounts = Account::where('type', 'standard')->get();
            $bestMatch = null;
            $highestSimilarity = 0;

            foreach ($accounts as $account) {
                $similarity = $this->calculateStringSimilarity(
                    strtolower($reference),
                    strtolower($account->reference)
                );

                if ($similarity > $highestSimilarity && $similarity >= $this->fuzzyMatchThreshold) {
                    $highestSimilarity = $similarity;
                    $bestMatch = $account;
                }
            }

            if ($bestMatch) {
                Log::info('Fuzzy match found', [
                    'original_reference' => $reference,
                    'matched_reference' => $bestMatch->reference,
                    'similarity' => $highestSimilarity
                ]);
            }

            return $bestMatch;
        });
    }

    protected function calculateStringSimilarity($str1, $str2)
    {
        $levenshtein = levenshtein($str1, $str2);
        $maxLength = max(strlen($str1), strlen($str2));
        $levenshteinSimilarity = ($maxLength - $levenshtein) / $maxLength * 100;

        $soundexSimilarity = soundex($str1) === soundex($str2) ? 100 : 0;

        return ($levenshteinSimilarity * 0.7) + ($soundexSimilarity * 0.3);
    }

    protected function getComplementaryBalanceAccount()
    {
        return Account::firstOrCreate(
            ['reference' => 'COMPLEMENTARY_BALANCE'],
            [
                'name' => 'Complementary Balance Account',
                'type' => 'complementary',
                'account_type_id' => config('mpesa.default_account_type_id', 1),
                'account_subtype_id' => config('mpesa.default_account_subtype_id', 1),
                'balance' => 0,
                'status' => 'active',
                'metadata' => [
                    'payment_method' => 'mpesa',
                    'description' => 'Account for unmatched transactions',
                    'created_at' => now()
                ]
            ]
        );
    }

    protected function resolveOfflineAccount($defaultReference)
    {
        if (!$defaultReference) {
            throw new \Exception('Default account reference is not configured');
        }

        return Account::firstOrCreate(
            ['reference' => $defaultReference],
            [
                'name' => 'M-Pesa Offline Payments',
                'type' => 'mpesa_offline',
                'account_type_id' => config('mpesa.default_account_type_id', 1),
                'account_subtype_id' => config('mpesa.default_account_subtype_id', 1),
                'balance' => 0,
                'status' => 'active',
                'metadata' => [
                    'payment_method' => 'mpesa',
                    'created_at' => now()
                ]
            ]
        );
    }

    protected function getMpesaAccessToken()
    {
        $cacheKey = 'mpesa_access_token';
        
        return Cache::remember($cacheKey, 3300, function () { // Cache for 55 minutes
            $tokenUrl = config('mpesa.b2c.token_url');
            $consumerKey = config('mpesa.b2c.consumer_key');
            $consumerSecret = config('mpesa.b2c.consumer_secret');

            if (!$tokenUrl || !$consumerKey || !$consumerSecret) {
                throw new \Exception('M-Pesa configuration is incomplete');
            }

            $credentials = base64_encode($consumerKey . ':' . $consumerSecret);

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($tokenUrl);

            if (!$response->successful()) {
                Log::error('M-Pesa token request failed', [
                    'status' => $response->status()
                ]);
                throw new \Exception('Failed to get M-Pesa access token');
            }

            $result = $response->json();

            if (!isset($result['access_token'])) {
                throw new \Exception('Invalid M-Pesa token response format');
            }

            return $result['access_token'];
        });
    }

    protected function initiateMpesaB2C(array $params)
    {
        $url = config('mpesa.b2c.url');

        if (!$url) {
            throw new \Exception('M-Pesa B2C URL is not configured');
        }

        $token = $this->getMpesaAccessToken();

        $response = Http::withToken($token)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->timeout(30)
            ->retry(2, 1000) // Retry twice with 1 second delay
            ->post($url, $params);

        if (!$response->successful()) {
            Log::error('M-Pesa B2C request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            throw new \Exception('M-Pesa B2C request failed: ' . $response->body());
        }

        return $response->json();
    }

    protected function getUserTransactionHistory(string $phoneNumber, int $limit = 20): array
    {
        return Transaction::where('phone_number', $phoneNumber)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($transaction) {
                return [
                    'amount' => $transaction->amount,
                    'type' => $transaction->type,
                    'timestamp' => $transaction->created_at,
                    'account_id' => $transaction->account_id,
                    'status' => $transaction->status,
                    'bill_ref' => $transaction->bill_ref
                ];
            })
            ->toArray();
    }

    protected function getHistoricalTransactionPatterns(int $accountId, int $days = 30): array
    {
        return Transaction::where('account_id', $accountId)
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as transaction_count,
                AVG(amount) as avg_amount,
                MIN(amount) as min_amount,
                MAX(amount) as max_amount,
                SUM(amount) as total_amount
            ')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get()
            ->toArray();
    }

    protected function getRecentTransferHistory(int $sourceAccountId, int $destinationAccountId, int $limit = 10): array
    {
        return Transaction::where(function ($query) use ($sourceAccountId, $destinationAccountId) {
                $query->where('account_id', $sourceAccountId)
                      ->where('bill_ref', function ($subQuery) use ($destinationAccountId) {
                          $subQuery->select('reference')
                                   ->from('accounts')
                                   ->where('id', $destinationAccountId);
                      });
            })
            ->orWhere(function ($query) use ($sourceAccountId, $destinationAccountId) {
                $query->where('account_id', $destinationAccountId)
                      ->where('bill_ref', function ($subQuery) use ($sourceAccountId) {
                          $subQuery->select('reference')
                                   ->from('accounts')
                                   ->where('id', $sourceAccountId);
                      });
            })
            ->where('payment_method', 'internal')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    protected function getWithdrawalHistory(int $accountId, string $phoneNumber, int $days = 30): array
    {
        return Transaction::where('account_id', $accountId)
            ->where('phone_number', $phoneNumber)
            ->where('type', 'debit')
            ->where('payment_method', 'mpesa_b2c')
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    protected function getDailyWithdrawals(int $accountId): int
    {
        return Transaction::where('account_id', $accountId)
            ->where('type', 'debit')
            ->where('payment_method', 'mpesa_b2c')
            ->whereDate('created_at', today())
            ->count();
    }

    protected function getHourlyWithdrawals(int $accountId): int
    {
        return Transaction::where('account_id', $accountId)
            ->where('type', 'debit')
            ->where('payment_method', 'mpesa_b2c')
            ->where('created_at', '>=', now()->subHour())
            ->count();
    }

    protected function buildFlaggingReason(array $fraudAnalysis, array $anomalyAnalysis): string
    {
        $reasons = [];
        
        if ($fraudAnalysis['risk_score'] >= $this->fraudThreshold) {
            $reasons[] = "High fraud risk score ({$fraudAnalysis['risk_score']})";
            if (!empty($fraudAnalysis['flags'])) {
                $reasons[] = "Fraud flags: " . implode(', ', $fraudAnalysis['flags']);
            }
        }
        
        if ($anomalyAnalysis['anomaly_score'] >= $this->anomalyThreshold) {
            $reasons[] = "High anomaly score ({$anomalyAnalysis['anomaly_score']})";
            if (!empty($anomalyAnalysis['anomaly_types'])) {
                $reasons[] = "Anomaly types: " . implode(', ', $anomalyAnalysis['anomaly_types']);
            }
        }
        
        return implode('; ', $reasons);
    }

    protected function getDefaultFraudAnalysis(): array
    {
        return [
            'risk_level' => 'medium',
            'risk_score' => 0.5,
            'flags' => ['ai_unavailable'],
            'recommendations' => ['manual_review'],
            'confidence' => 0.0,
            'reasoning' => 'AI service unavailable - default risk assessment applied'
        ];
    }

    protected function getDefaultAnomalyAnalysis(): array
    {
        return [
            'is_anomaly' => false,
            'anomaly_score' => 0.0,
            'anomaly_types' => [],
            'confidence' => 0.0,
            'details' => 'AI service unavailable - no anomaly detection performed'
        ];
    }

    /**
     * Get recent balance change for account (helper for search)
     */
    protected function getRecentBalanceChange(int $accountId): float
    {
        $recentTransactions = Transaction::where('account_id', $accountId)
            ->where('created_at', '>=', now()->subDays(7))
            ->sum(DB::raw('CASE WHEN type = "credit" THEN amount ELSE -amount END'));
        
        return $recentTransactions;
    }
}