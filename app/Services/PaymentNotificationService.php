<?php
namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PaymentNotificationService
{
    // The API URL is now a protected property, not a constant
    protected $whatsappApiUrl;

    protected $treasurers = [
        ['phone' => '254706400432', 'name' => 'Elijah Kibuchi'],
        ['phone' => '254708405553', 'name' => 'Loise Wambui'],
        ['phone' => '254794711258', 'name' => 'Joy Masinde'],
    ];

    protected $memberDbConnection;
    protected $accessToken;

    public function __construct()
    {
        try {
            $this->memberDbConnection = DB::connection('member_db');
            $this->memberDbConnection->getPdo();
            Log::debug('Successfully connected to member_db');
        } catch (\Exception $e) {
            Log::error('Database connection error', ['error' => $e->getMessage()]);
            $this->memberDbConnection = DB::connection();
        }

        // Get the access token and phone number ID from the environment variables
        $this->accessToken = env('WHATSAPP_ACCESS_TOKEN');
        $phoneNumberId = env('WHATSAPP_PHONE_NUMBER_ID');

        // Set the API URL at runtime in the constructor
        if ($phoneNumberId) {
            $this->whatsappApiUrl = 'https://graph.facebook.com/v22.0/' . $phoneNumberId . '/messages';
        } else {
            Log::error('WHATSAPP_PHONE_NUMBER_ID not set in environment.');
            $this->whatsappApiUrl = ''; // Default to an empty string to prevent errors
        }

        if (empty($this->accessToken)) {
            Log::error('WHATSAPP_ACCESS_TOKEN not set in environment.');
        }
    }

    /**
     * **NEW METHOD: Notify treasurers about withdrawal activities**
     * This method sends notifications to all treasurers about withdrawal attempts (success or failure)
     */
    public function notifyTreasurersAboutWithdrawal($withdrawal, string $status, string $errorMessage = null)
    {
        try {
            Log::info('Starting withdrawal notification to treasurers', [
                'withdrawal_id' => $withdrawal->id ?? null,
                'status' => $status,
                'amount' => $withdrawal->amount ?? null,
                'error_message' => $errorMessage
            ]);

            $successCount = 0;
            $totalTreasurers = count($this->treasurers);

            // Load the account relationship if needed
            if (!isset($withdrawal->account)) {
                $withdrawal->load('account');
            }

            foreach ($this->treasurers as $treasurer) {
                try {
                    $notificationResult = $this->sendWithdrawalNotificationToTreasurer(
                        $treasurer, 
                        $withdrawal, 
                        $status, 
                        $errorMessage
                    );

                    if ($notificationResult['sms'] || $notificationResult['whatsapp']) {
                        $successCount++;
                    }

                    Log::debug('Treasurer withdrawal notification result', [
                        'treasurer' => $treasurer['name'],
                        'phone' => $treasurer['phone'],
                        'sms_success' => $notificationResult['sms'],
                        'whatsapp_success' => $notificationResult['whatsapp'],
                        'withdrawal_id' => $withdrawal->id ?? null,
                        'status' => $status
                    ]);

                } catch (\Exception $e) {
                    Log::error('Failed to notify treasurer about withdrawal', [
                        'treasurer_name' => $treasurer['name'],
                        'phone' => $treasurer['phone'],
                        'error' => $e->getMessage(),
                        'withdrawal_id' => $withdrawal->id ?? null,
                        'status' => $status
                    ]);
                }
            }

            Log::info('Withdrawal treasurer notifications completed', [
                'withdrawal_id' => $withdrawal->id ?? null,
                'status' => $status,
                'success_count' => $successCount,
                'total_treasurers' => $totalTreasurers
            ]);

            return [
                'success' => $successCount > 0,
                'success_count' => $successCount,
                'total_treasurers' => $totalTreasurers
            ];

        } catch (\Exception $e) {
            Log::error('Withdrawal treasurer notification process failed', [
                'error' => $e->getMessage(),
                'withdrawal_id' => $withdrawal->id ?? null,
                'status' => $status,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'success_count' => 0,
                'total_treasurers' => count($this->treasurers),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send withdrawal notification to individual treasurer
     */
    protected function sendWithdrawalNotificationToTreasurer($treasurer, $withdrawal, string $status, string $errorMessage = null)
    {
        $timestamp = now()->addHours(3)->format('d/m/Y H:i');
        $amount = number_format($withdrawal->amount ?? 0, 2);
        $withdrawalId = $withdrawal->id ?? 'Unknown';
        $accountName = $withdrawal->account->name ?? 'Unknown Account';
        $recipientPhone = $withdrawal->phone_number ?? 'Unknown';
        $initiatedBy = $withdrawal->initiated_by_name ?? 'Unknown User';

        // Create different messages based on status
        switch ($status) {
            case 'initiated':
                $smsMessage = sprintf(
                    "WITHDRAWAL ALERT: Dear %s, A withdrawal of KES %s has been INITIATED by %s from account '%s' to phone %s on %s. Withdrawal ID: %s. Status: PENDING. MOUT JKUAT SYSTEM.",
                    $treasurer['name'],
                    $amount,
                    $initiatedBy,
                    $accountName,
                    $recipientPhone,
                    $timestamp,
                    $withdrawalId
                );

                $whatsappTemplate = 'withdrawal_initiated';
                $templateData = [
                    'treasurer_name' => $treasurer['name'],
                    'amount' => $amount,
                    'initiated_by' => $initiatedBy,
                    'account_name' => $accountName,
                    'recipient_phone' => $recipientPhone,
                    'timestamp' => $timestamp,
                    'withdrawal_id' => $withdrawalId
                ];
                break;

            case 'completed':
                $smsMessage = sprintf(
                    "WITHDRAWAL SUCCESS: Dear %s, Withdrawal of KES %s by %s from account '%s' to phone %s has been SUCCESSFULLY COMPLETED on %s. Withdrawal ID: %s. MOUT JKUAT SYSTEM.",
                    $treasurer['name'],
                    $amount,
                    $initiatedBy,
                    $accountName,
                    $recipientPhone,
                    $timestamp,
                    $withdrawalId
                );

                $whatsappTemplate = 'withdrawal_completed';
                $templateData = [
                    'treasurer_name' => $treasurer['name'],
                    'amount' => $amount,
                    'initiated_by' => $initiatedBy,
                    'account_name' => $accountName,
                    'recipient_phone' => $recipientPhone,
                    'timestamp' => $timestamp,
                    'withdrawal_id' => $withdrawalId
                ];
                break;

            case 'failed':
                $smsMessage = sprintf(
                    "WITHDRAWAL FAILED: Dear %s, Withdrawal of KES %s by %s from account '%s' to phone %s has FAILED on %s. Withdrawal ID: %s. Reason: %s. Please review. MOUT JKUAT SYSTEM.",
                    $treasurer['name'],
                    $amount,
                    $initiatedBy,
                    $accountName,
                    $recipientPhone,
                    $timestamp,
                    $withdrawalId,
                    $errorMessage ?? 'Unknown error'
                );

                $whatsappTemplate = 'withdrawal_failed';
                $templateData = [
                    'treasurer_name' => $treasurer['name'],
                    'amount' => $amount,
                    'initiated_by' => $initiatedBy,
                    'account_name' => $accountName,
                    'recipient_phone' => $recipientPhone,
                    'timestamp' => $timestamp,
                    'withdrawal_id' => $withdrawalId,
                    'error_message' => $errorMessage ?? 'Unknown error'
                ];
                break;

            case 'timeout':
                $smsMessage = sprintf(
                    "WITHDRAWAL TIMEOUT: Dear %s, Withdrawal of KES %s by %s from account '%s' to phone %s has TIMED OUT on %s. Withdrawal ID: %s. Reason: %s. Manual verification required. MOUT JKUAT SYSTEM.",
                    $treasurer['name'],
                    $amount,
                    $initiatedBy,
                    $accountName,
                    $recipientPhone,
                    $timestamp,
                    $withdrawalId,
                    $errorMessage ?? 'Transaction timeout'
                );

                $whatsappTemplate = 'withdrawal_timeout';
                $templateData = [
                    'treasurer_name' => $treasurer['name'],
                    'amount' => $amount,
                    'initiated_by' => $initiatedBy,
                    'account_name' => $accountName,
                    'recipient_phone' => $recipientPhone,
                    'timestamp' => $timestamp,
                    'withdrawal_id' => $withdrawalId,
                    'timeout_reason' => $errorMessage ?? 'Transaction timeout'
                ];
                break;

            default:
                $smsMessage = sprintf(
                    "WITHDRAWAL UPDATE: Dear %s, Withdrawal of KES %s from account '%s' status changed to %s on %s. Withdrawal ID: %s. MOUT JKUAT SYSTEM.",
                    $treasurer['name'],
                    $amount,
                    $accountName,
                    strtoupper($status),
                    $timestamp,
                    $withdrawalId
                );

                $whatsappTemplate = 'withdrawal_status_update';
                $templateData = [
                    'treasurer_name' => $treasurer['name'],
                    'amount' => $amount,
                    'account_name' => $accountName,
                    'status' => strtoupper($status),
                    'timestamp' => $timestamp,
                    'withdrawal_id' => $withdrawalId
                ];
                break;
        }

        $notificationResults = [
            'sms' => false,
            'whatsapp' => false
        ];

        // Send SMS notification
        try {
            $notificationResults['sms'] = $this->sendSMS($treasurer['phone'], $smsMessage);
            Log::debug('Treasurer withdrawal SMS sent', [
                'treasurer' => $treasurer['name'],
                'phone' => $treasurer['phone'],
                'success' => $notificationResults['sms'],
                'status' => $status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send withdrawal SMS to treasurer', [
                'treasurer' => $treasurer['name'],
                'error' => $e->getMessage(),
                'withdrawal_id' => $withdrawalId
            ]);
        }

        // Send WhatsApp notification (if template exists)
        try {
            $notificationResults['whatsapp'] = $this->send_official_whatsapp_message(
                $treasurer['phone'], 
                $treasurer['name'], 
                $whatsappTemplate, 
                $templateData
            );
            
            Log::debug('Treasurer withdrawal WhatsApp sent', [
                'treasurer' => $treasurer['name'],
                'phone' => $treasurer['phone'],
                'success' => $notificationResults['whatsapp'],
                'template' => $whatsappTemplate,
                'status' => $status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send withdrawal WhatsApp to treasurer', [
                'treasurer' => $treasurer['name'],
                'error' => $e->getMessage(),
                'template' => $whatsappTemplate,
                'withdrawal_id' => $withdrawalId
            ]);
        }

        return $notificationResults;
    }

    // ... (keep all existing methods below - just showing the additions above)

    protected function getMemberByMMID($mmid)
    {
        try {
            $member = $this->memberDbConnection->table('members')
                ->where('mmid', $mmid)
                ->select(['id', 'name', 'whatsapp', 'phone', 'wallet_balance'])
                ->first();

            Log::debug('Member lookup result', [
                'mmid' => $mmid,
                'member_found' => $member ? true : false,
                'has_whatsapp' => $member && !empty($member->whatsapp),
                'has_phone' => $member && !empty($member->phone)
            ]);

            return $member;
        } catch (\Exception $e) {
            Log::error('Member lookup error', ['error' => $e->getMessage(), 'mmid' => $mmid]);
            return null;
        }
    }

    protected function getValidPhone($member)
    {
        if (!empty($member->whatsapp)) {
            return $member->whatsapp;
        }

        if (!empty($member->phone)) {
            return $member->phone;
        }

        return null;
    }

    protected function formatPhoneNumber($phone, $addPlus = false)
    {
        $cleaned = preg_replace('/[^\d]/', '', $phone);

        if (strlen($cleaned) == 9 && $cleaned[0] == '7') {
            $cleaned = '254' . $cleaned;
        } elseif (strlen($cleaned) == 10 && $cleaned[0] == '0') {
            $cleaned = '254' . substr($cleaned, 1);
        } elseif (strlen($cleaned) == 12 && substr($cleaned, 0, 3) == '254') {
            // Already in correct format
        } else {
            Log::warning('Unusual phone number format', ['phone' => $phone, 'cleaned' => $cleaned]);
        }

        return $addPlus ? '+' . $cleaned : $cleaned;
    }

    public function sendWalletNotificationToMember($transaction, $additionalData = [])
    {
        try {
            Log::debug('Starting wallet notification to member', [
                'transaction_id' => $transaction->id ?? $transaction['id'] ?? null,
                'transaction_type' => $transaction->type ?? $transaction['type'] ?? null,
                'amount' => $transaction->amount ?? $transaction['amount'] ?? null,
                'full_transaction' => $transaction,
                'additional_data' => $additionalData
            ]);

            $transactionData = is_object($transaction) ? $transaction->toArray() : $transaction;
            $mmid = $this->extractMMIDFromTransaction($transactionData, $additionalData);

            if (!$mmid) {
                Log::warning('No MMID found for wallet notification', [
                    'transaction_id' => $transactionData['id'] ?? null,
                    'transaction_data_keys' => array_keys($transactionData),
                    'metadata' => $transactionData['metadata'] ?? null,
                    'additional_data' => $additionalData,
                    'user_id' => $transactionData['user_id'] ?? null,
                    'member_id' => $transactionData['member_id'] ?? null,
                    'source_wallet_id' => $transactionData['source_wallet_id'] ?? null,
                    'destination_wallet_id' => $transactionData['destination_wallet_id'] ?? null
                ]);

                $mmid = $this->findMMIDAlternativeMethod($transactionData, $additionalData);

                if (!$mmid) {
                    Log::error('Still no MMID found after alternative search', ['transaction_data' => $transactionData]);
                    return false;
                }
            }

            Log::info('MMID found, proceeding with notification', ['mmid' => $mmid]);
            return $this->sendWalletTransactionNotification($transactionData, $mmid);

        } catch (\Exception $e) {
            Log::error('Wallet notification to member failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id ?? $transaction['id'] ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    // ... (continue with all other existing methods - truncated for brevity)
    // Include all the other existing methods: findMMIDAlternativeMethod, sendWalletTransactionNotification, 
    // sendPaymentNotifications, sendSMS, send_official_whatsapp_message, etc.

    protected function sendSMS($to, $message)
    {
        $apiUrl = 'https://blessedtexts.com/api/sms/v1/sendsms';
        $formattedTo = $this->formatPhoneNumber($to);

        $postData = [
            'api_key' => env('SMS_API_KEY', 'af09ec090e4c42498d52bb2673ff559b'),
            'sender_id' => 'FERRITE',
            'message' => $message,
            'phone' => $formattedTo
        ];

        try {
            Log::debug('Sending SMS', [
                'phone' => $formattedTo,
                'message_length' => strlen($message)
            ]);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $apiUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);

            if ($curlError) {
                Log::error('SMS cURL error', [
                    'error' => $curlError,
                    'phone' => $formattedTo
                ]);
                return false;
            }

            $responseData = json_decode($response, true);
            $success = $httpCode == 200 && is_array($responseData) &&
                         isset($responseData[0]['status_code']) && $responseData[0]['status_code'] === '1000';

            Log::debug('SMS response', [
                'phone' => $formattedTo,
                'success' => $success,
                'http_code' => $httpCode,
                'response' => $responseData
            ]);

            if (!$success) {
                Log::error('SMS API error', [
                    'phone' => $formattedTo,
                    'response' => $responseData,
                    'http_code' => $httpCode
                ]);
            }

            return $success;
        } catch (\Exception $e) {
            Log::error('SMS exception', [
                'error' => $e->getMessage(),
                'phone' => $formattedTo
            ]);
            return false;
        } finally {
            if (isset($ch) && is_resource($ch)) {
                curl_close($ch);
            }
        }
    }

    protected function send_official_whatsapp_message($to, $name, $templateName, $templateData)
    {
        try {
            if (empty($this->accessToken)) {
                Log::error('WhatsApp access token is missing.');
                return false;
            }

            $formattedTo = $this->formatPhoneNumber($to, false);
            
            // Build the parameters array based on the template data
            $parameters = [];
            foreach ($templateData as $value) {
                $parameters[] = ['type' => 'text', 'text' => $value];
            }

            // Try with different language codes since some templates are 'en' and some are 'en_US'
            $languageCodes = ['en', 'en_US'];
            
            foreach ($languageCodes as $langCode) {
                $postData = [
                    'messaging_product' => 'whatsapp',
                    'to' => $formattedTo,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => [
                            'code' => $langCode
                        ],
                        'components' => [
                            [
                                'type' => 'body',
                                'parameters' => $parameters
                            ]
                        ]
                    ]
                ];

                Log::debug('Sending Official WhatsApp Template Message', [
                    'to' => $formattedTo,
                    'template_name' => $templateName,
                    'language_code' => $langCode,
                    'attempt' => array_search($langCode, $languageCodes) + 1
                ]);

                $ch = curl_init();
                curl_setopt_array($ch, [
                    CURLOPT_URL => $this->whatsappApiUrl,
                    CURLOPT_POST => 1,
                    CURLOPT_POSTFIELDS => json_encode($postData),
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER => [
                        'Content-Type: application/json',
                        'Authorization: Bearer ' . $this->accessToken
                    ],
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_SSL_VERIFYPEER => true,
                    CURLOPT_SSL_VERIFYHOST => 2
                ]);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlError = curl_error($ch);

                if ($curlError) {
                    Log::error('WhatsApp cURL error', [
                        'error' => $curlError, 
                        'phone' => $formattedTo,
                        'language_code' => $langCode
                    ]);
                    curl_close($ch);
                    continue; // Try next language code
                }

                $responseData = json_decode($response, true);
                $success = $httpCode == 200 && is_array($responseData) && isset($responseData['messages']);

                if ($success) {
                    Log::debug('WhatsApp message sent successfully', [
                        'phone' => $formattedTo,
                        'template_name' => $templateName,
                        'language_code' => $langCode
                    ]);
                    curl_close($ch);
                    return true; // Success - exit function
                } else {
                    Log::debug('WhatsApp attempt failed with language code', [
                        'phone' => $formattedTo,
                        'http_code' => $httpCode,
                        'language_code' => $langCode,
                        'response' => $responseData
                    ]);
                }

                curl_close($ch);
                
                // Check if the error is specifically about template not existing
                if (isset($responseData['error']['code']) && $responseData['error']['code'] == 132001) {
                    // Template doesn't exist for this language code, try next one
                    continue;
                } else {
                    // Some other error, log and try next language code
                    Log::warning('WhatsApp API error for language code', [
                        'phone' => $formattedTo,
                        'http_code' => $httpCode,
                        'language_code' => $langCode,
                        'response' => $responseData
                    ]);
                    continue;
                }
            }

            // If we get here, all language codes failed
            Log::error('WhatsApp template failed for all language codes', [
                'phone' => $formattedTo,
                'template_name' => $templateName,
                'tried_languages' => $languageCodes
            ]);
            
            return false;

        } catch (\Exception $e) {
            Log::error('WhatsApp send failed', [
                'error' => $e->getMessage(),
                'phone' => $to,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    // Keep all other existing methods from the original service
    protected function findMMIDAlternativeMethod($transactionData, $additionalData = [])
    {
        if (isset($transactionData['user_id'])) {
            $mmid = $this->getMemberMMIDByUserId($transactionData['user_id']);
            if ($mmid) {
                Log::info('MMID found via user_id', ['user_id' => $transactionData['user_id'], 'mmid' => $mmid]);
                return $mmid;
            }
        }

        if (isset($transactionData['member_id'])) {
            $mmid = $this->getMemberMMIDByMemberId($transactionData['member_id']);
            if ($mmid) {
                Log::info('MMID found via member_id', ['member_id' => $transactionData['member_id'], 'mmid' => $mmid]);
                return $mmid;
            }
        }

        $walletIds = [];
        if (isset($transactionData['source_wallet_id'])) {
            $walletIds[] = $transactionData['source_wallet_id'];
        }
        if (isset($transactionData['destination_wallet_id'])) {
            $walletIds[] = $transactionData['destination_wallet_id'];
        }

        foreach ($walletIds as $walletId) {
            $mmid = $this->getMemberMMIDByWalletId($walletId);
            if ($mmid) {
                Log::info('MMID found via wallet_id', ['wallet_id' => $walletId, 'mmid' => $mmid]);
                return $mmid;
            }
        }

        return null;
    }

    protected function getMemberMMIDByUserId($userId)
    {
        try {
            $member = $this->memberDbConnection->table('members')
                ->where('user_id', $userId)
                ->select(['mmid'])
                ->first();

            return $member ? $member->mmid : null;
        } catch (\Exception $e) {
            Log::error('Error getting member MMID by user ID', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return null;
        }
    }

    protected function getMemberMMIDByMemberId($memberId)
    {
        try {
            $member = $this->memberDbConnection->table('members')
                ->where('id', $memberId)
                ->select(['mmid'])
                ->first();

            return $member ? $member->mmid : null;
        } catch (\Exception $e) {
            Log::error('Error getting member MMID by member ID', ['error' => $e->getMessage(), 'member_id' => $memberId]);
            return null;
        }
    }

    protected function getMemberMMIDByWalletId($walletId)
    {
        try {
            $wallet = $this->memberDbConnection->table('wallets')
                ->where('id', $walletId)
                ->select(['user_id', 'member_id'])
                ->first();

            if ($wallet) {
                if ($wallet->member_id) {
                    return $this->getMemberMMIDByMemberId($wallet->member_id);
                }
                if ($wallet->user_id) {
                    return $this->getMemberMMIDByUserId($wallet->user_id);
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error getting member MMID by wallet ID', ['error' => $e->getMessage(), 'wallet_id' => $walletId]);
            return null;
        }
    }

    public function sendWalletTransactionNotification($transaction, $mmid)
    {
        try {
            Log::debug('Starting wallet notification', [
                'transaction_id' => $transaction['reference'] ?? $transaction['id'] ?? null,
                'mmid' => $mmid,
                'transaction_type' => $transaction['type'] ?? null
            ]);

            $requiredFields = ['type', 'amount'];
            foreach ($requiredFields as $field) {
                if (!isset($transaction[$field])) {
                    Log::error('Missing required transaction field', [
                        'field' => $field,
                        'transaction' => $transaction,
                        'mmid' => $mmid
                    ]);
                    return false;
                }
            }

            $member = $this->getMemberByMMID($mmid);
            if (!$member) {
                Log::warning('Member not found for wallet notification', ['mmid' => $mmid]);
                return false;
            }

            $whatsappPhone = $this->getValidPhone($member);
            if (!$whatsappPhone) {
                Log::warning('Member has no valid phone number', [
                    'mmid' => $mmid,
                    'member_id' => $member->id ?? null,
                    'whatsapp' => $member->whatsapp ?? null,
                    'phone' => $member->phone ?? null
                ]);
                return false;
            }

            $currentBalance = $this->getCurrentBalance($transaction, $member);
            $smsMessage = $this->formatWalletSMSMessage($transaction, $member, $currentBalance);

            $notificationResults = [
                'sms' => false,
                'whatsapp' => false
            ];

            try {
                Log::info('Attempting to send SMS', [
                    'phone' => $whatsappPhone,
                    'mmid' => $mmid,
                    'member_name' => $member->name
                ]);

                $notificationResults['sms'] = $this->sendSMS($whatsappPhone, $smsMessage);
                Log::info('SMS attempt result', [
                    'phone' => $whatsappPhone,
                    'success' => $notificationResults['sms'],
                    'message_length' => strlen($smsMessage)
                ]);
            } catch (\Exception $e) {
                Log::error('SMS sending failed', [
                    'error' => $e->getMessage(),
                    'phone' => $whatsappPhone,
                    'mmid' => $mmid
                ]);
            }

            try {
                Log::info('Attempting to send WhatsApp', [
                    'phone' => $whatsappPhone,
                    'mmid' => $mmid,
                    'member_name' => $member->name
                ]);

                $whatsappTemplateData = [
                    'amount' => number_format($transaction['amount'], 2),
                    'balance' => number_format($currentBalance, 2),
                    'reference' => $transaction['reference'] ?? $transaction['id'] ?? 'N/A',
                    'timestamp' => now()->addHours(3)->format('d/m/Y H:i')
                ];

                $notificationResults['whatsapp'] = $this->send_official_whatsapp_message($whatsappPhone, $member->name, 'wallet_notification', $whatsappTemplateData);
                Log::info('WhatsApp attempt result', [
                    'phone' => $whatsappPhone,
                    'success' => $notificationResults['whatsapp']
                ]);
            } catch (\Exception $e) {
                Log::error('WhatsApp sending failed', [
                    'error' => $e->getMessage(),
                    'phone' => $whatsappPhone,
                    'mmid' => $mmid
                ]);
            }

            Log::info('Wallet notification completed', [
                'mmid' => $mmid,
                'transaction_id' => $transaction['reference'] ?? $transaction['id'] ?? null,
                'results' => $notificationResults
            ]);

            return $notificationResults['sms'] || $notificationResults['whatsapp'];
        } catch (\Exception $e) {
            Log::error('Wallet notification failed', [
                'error' => $e->getMessage(),
                'mmid' => $mmid,
                'transaction_id' => $transaction['reference'] ?? $transaction['id'] ?? null
            ]);
            return false;
        }
    }

    // Continue with all other existing methods...
    protected function extractMMIDFromTransaction($transactionData, $additionalData = [])
    {
        if (isset($transactionData['metadata']['mmid'])) {
            return $transactionData['metadata']['mmid'];
        } elseif (isset($additionalData['mmid'])) {
            return $additionalData['mmid'];
        } elseif (isset($transactionData['mmid'])) {
            return $transactionData['mmid'];
        } elseif (isset($transactionData['payer_name']) && preg_match('/MMID[:\s]*(\d+)/i', $transactionData['payer_name'], $matches)) {
            return $matches[1];
        } elseif (isset($transactionData['bill_ref']) && preg_match('/MMID[:\s]*(\d+)/i', $transactionData['bill_ref'], $matches)) {
            return $matches[1];
        } elseif (isset($transactionData['description']) && preg_match('/MMID[:\s]*(\d+)/i', $transactionData['description'], $matches)) {
            return $matches[1];
        } elseif (isset($transactionData['phone_number'])) {
            return $this->getMemberMMIDByPhone($transactionData['phone_number']);
        }

        return null;
    }

    protected function getMemberMMIDByPhone($phoneNumber)
    {
        try {
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);

            $member = $this->memberDbConnection->table('members')
                ->where('whatsapp', $formattedPhone)
                ->orWhere('phone', $formattedPhone)
                ->orWhere('whatsapp', $this->formatPhoneNumber($phoneNumber, true))
                ->orWhere('phone', $this->formatPhoneNumber($phoneNumber, true))
                ->select(['mmid'])
                ->first();

            return $member ? $member->mmid : null;
        } catch (\Exception $e) {
            Log::error('Error getting member MMID by phone', ['error' => $e->getMessage(), 'phone' => $phoneNumber]);
            return null;
        }
    }

    protected function getCurrentBalance($transaction, $member)
    {
        if (isset($transaction['metadata']['new_balance'])) {
            return $transaction['metadata']['new_balance'];
        }

        $previousBalance = $member->wallet_balance ?? 0;
        $amount = floatval($transaction['amount']);

        if ($transaction['type'] === 'credit') {
            return $previousBalance + $amount;
        } elseif ($transaction['type'] === 'debit') {
            return $previousBalance - $amount;
        }

        return $previousBalance;
    }

    protected function formatWalletSMSMessage($transaction, $member, $currentBalance)
    {
        $amount = number_format($transaction['amount'], 2);
        $balance = number_format($currentBalance, 2);
        $transactionType = strtoupper($transaction['type']);
        $reference = $transaction['reference'] ?? $transaction['id'] ?? 'N/A';
        $timestamp = now()->addHours(3)->format('d/m/Y H:i');

        return sprintf(
            "Dear %s, Your wallet has been %s with KES %s. Transaction Ref: %s. Current Balance: KES %s. Time: %s. MOUT JKUAT SYSTEM.",
            $member->name,
            $transactionType === 'CREDIT' ? 'credited' : 'debited',
            $amount,
            $reference,
            $balance,
            $timestamp
        );
    }

    public function sendPaymentNotifications($transaction, $phoneNumber, $payerName)
    {
        try {
            Log::debug('Starting payment notifications', [
                'transaction_id' => $transaction->id,
                'phone_number' => $phoneNumber,
                'payer_name' => $payerName
            ]);

            $smsSuccess = $this->sendPayerSMS($transaction, $phoneNumber, $payerName);
            $whatsappSuccess = $this->sendPayerWhatsApp($transaction, $phoneNumber, $payerName);
            $treasurerResult = $this->notifyTreasurers($transaction);

            $results = [
                'sms' => $smsSuccess,
                'whatsapp' => $whatsappSuccess,
                'treasurers' => $treasurerResult
            ];

            Log::info('Payment notifications completed', [
                'transaction_id' => $transaction->id,
                'results' => $results
            ]);

            return $smsSuccess || $whatsappSuccess || $treasurerResult['success'];
        } catch (\Exception $e) {
            Log::error('Payment notifications failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id ?? null
            ]);
            return false;
        }
    }

    protected function sendPayerSMS($transaction, $phoneNumber, $payerName)
    {
        $timestamp = $transaction->processed_at->addHours(3)->format('d/m/Y H:i');
        $message = sprintf(
            "Dear %s, MPESA payment of KES %s to Account %s was successful on %s. MPESA Reference: %s. Be blessed for your generous giving to MOUT JKUAT ACCOUNT. For more information: https://shorturl.at/Y7hkS.",
            $payerName ?? 'Valued Customer',
            number_format($transaction->amount, 2),
            $transaction->account->name ?? 'Default Account',
            $timestamp,
            $transaction->transaction_id
        );

        $success = $this->sendSMS($phoneNumber, $message);
        Log::debug('Payer SMS attempt', [
            'phone' => $phoneNumber,
            'success' => $success,
            'message_length' => strlen($message)
        ]);
        return $success;
    }

    protected function sendPayerWhatsApp($transaction, $phoneNumber, $payerName)
    {
        $timestamp = $transaction->processed_at->addHours(3)->format('d/m/Y H:i');
        
        $templateData = [
            'payer_name' => $payerName ?? 'Valued Customer',
            'amount' => number_format($transaction->amount, 2),
            'account_name' => $transaction->account->name ?? 'Default Account',
            'reference' => $transaction->transaction_id,
            'timestamp' => $timestamp
        ];

        $success = $this->send_official_whatsapp_message($phoneNumber, $payerName ?? 'Valued Customer', 'payment_confirmed', $templateData);
        Log::debug('Payer WhatsApp attempt', [
            'phone' => $phoneNumber,
            'success' => $success
        ]);
        return $success;
    }

    protected function notifyTreasurers($transaction)
    {
        $successCount = 0;
        $totalTreasurers = count($this->treasurers);

        foreach ($this->treasurers as $treasurer) {
            try {
                $timestamp = $transaction->processed_at->addHours(3)->format('d/m/Y H:i');
                $smsMessage = sprintf(
                    "Dear %s, %s has made a payment of KES %s TO MOUT JKUAT Ministry Account %s Via MPESA on %s, MPESA reference %s New account balance KES %s Check accounts via admin https://shorturl.at/0eAfS",
                    $treasurer['name'],
                    $transaction->payer_name ?? 'Unknown Payer',
                    number_format($transaction->amount, 2),
                    $transaction->account->name ?? 'Default Account',
                    $timestamp,
                    $transaction->transaction_id,
                    number_format($transaction->account->balance ?? 0, 2)
                );

                $treasurerTemplateData = [
                    'treasurer_name' => $treasurer['name'],
                    'payer_name' => $transaction->payer_name ?? 'Unknown Payer',
                    'amount' => number_format($transaction->amount, 2),
                    'account_name' => $transaction->account->name ?? 'Default Account',
                    'timestamp' => $timestamp,
                    'reference' => $transaction->transaction_id,
                    'balance' => number_format($transaction->account->balance ?? 0, 2)
                ];

                $smsSuccess = $this->sendSMS($treasurer['phone'], $smsMessage);
                $whatsappSuccess = $this->send_official_whatsapp_message($treasurer['phone'], $treasurer['name'], 'payment_confirmation_2', $treasurerTemplateData);

                if ($smsSuccess || $whatsappSuccess) {
                    $successCount++;
                }

                Log::debug('Treasurer notification attempt', [
                    'treasurer' => $treasurer['name'],
                    'phone' => $treasurer['phone'],
                    'sms_success' => $smsSuccess,
                    'whatsapp_success' => $whatsappSuccess,
                    'transaction_id' => $transaction->id
                ]);
            } catch (\Exception $e) {
                Log::error('Treasurer notification failed', [
                    'treasurer_name' => $treasurer['name'],
                    'phone' => $treasurer['phone'],
                    'error' => $e->getMessage(),
                    'transaction_id' => $transaction->id
                ]);
            }
        }

        return [
            'success' => $successCount > 0,
            'success_count' => $successCount,
            'total_treasurers' => $totalTreasurers
        ];
    }

    public function sendAirtimePurchaseNotification($phoneNumber, $amount, $requestId)
    {
        $timestamp = now()->addHours(3)->format('d/m/Y H:i');
        $message = sprintf(
            "Dear Customer, Your airtime purchase of KES %s has been successfully processed on %s. Transaction ID: %s Amount: KES %s MOUT JKUAT SYSTEM.",
            number_format($amount, 2),
            $timestamp,
            $requestId,
            number_format($amount, 2)
        );

        $success = $this->sendSMS($phoneNumber, $message);
        Log::debug('Airtime notification attempt', [
            'phone' => $phoneNumber,
            'success' => $success,
            'message_length' => strlen($message)
        ]);
        return $success;
    }
}