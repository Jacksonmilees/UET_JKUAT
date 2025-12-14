<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDF;
use Carbon\Carbon;
use App\Mail\DailyAccountStatement;
use Exception;

class AccountStatementService
{
    protected $accountService;


    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
        // Removed member_db connection to avoid deployment error
    }

    public function generateAccountStatements($startDate = null, $endDate = null)
    {
        $processedAccounts = 0;
        $failedAccounts = 0;
        $statementsSent = 0;

        try {
            // Default to account creation to yesterday if no dates specified
            $startDate = $startDate ?? Carbon::now()->subYears(10)->startOfDay();
            $endDate = $endDate ?? Carbon::yesterday()->endOfDay();

            Account::where('type', 'standard')
                  ->where('status', 'active')
                  ->chunk(100, function($accounts) use (
                      &$processedAccounts, 
                      &$failedAccounts, 
                      &$statementsSent, 
                      $startDate, 
                      $endDate
                  ) {
                      foreach ($accounts as $account) {
                          try {
                              $result = $this->processAccountStatement($account, $startDate, $endDate);
                              $processedAccounts++;
                              
                              if ($result) {
                                  $statementsSent++;
                              }
                          } catch (Exception $accountException) {
                              $failedAccounts++;
                              Log::error('Account statement generation failed', [
                                  'account_id' => $account->id,
                                  'reference' => $account->reference,
                                  'error' => $accountException->getMessage(),
                                  'trace' => $accountException->getTraceAsString()
                              ]);
                          }
                      }
                  });

            Log::info('Account statements processing completed', [
                'total_processed' => $processedAccounts,
                'total_failed' => $failedAccounts,
                'statements_sent' => $statementsSent,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ]);

            return [
                'processed' => $processedAccounts,
                'failed' => $failedAccounts,
                'sent' => $statementsSent
            ];

        } catch (Exception $e) {
            Log::critical('Catastrophic failure in account statement generation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    protected function processAccountStatement(Account $account, $startDate, $endDate)
    {
        // Validate account existence and basic details
        if (!$account || $account->status !== 'active') {
            throw new Exception('Invalid or inactive account');
        }

        // Override start date with account creation if it's earlier
        $effectiveStartDate = max(
            Carbon::parse($account->created_at)->startOfDay(), 
            $startDate
        );

        // Retrieve transactions
        $transactions = Transaction::where('account_id', $account->id)
            ->whereBetween('created_at', [$effectiveStartDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get();

        // Skip if no transactions
        if ($transactions->isEmpty()) {
            Log::info('No transactions found for account', [
                'account_id' => $account->id,
                'reference' => $account->reference
            ]);
            return false;
        }

        // Retrieve member details
        $member = $this->getMemberByMMID($account->reference);
        
        if (!$member || empty($member->email)) {
            Log::warning('Invalid member or missing email', [
                'account_id' => $account->id,
                'reference' => $account->reference
            ]);
            return false;
        }

        // Generate statement
        $statement = $this->generateStatementData(
            $account, 
            $transactions, 
            $effectiveStartDate, 
            $endDate, 
            $member
        );
        
        // PDF generation
        try {
            $pdf = $this->generatePDF($statement);
        } catch (Exception $pdfException) {
            Log::error('PDF generation failed', [
                'account_id' => $account->id,
                'error' => $pdfException->getMessage()
            ]);
            return false;
        }

        // Send email
        $this->sendStatementEmail($account, $pdf, $statement, $member);

        Log::info('Statement processed successfully', [
            'account_id' => $account->id,
            'reference' => $account->reference,
            'member_id' => $member->id,
            'transaction_count' => $transactions->count()
        ]);

        return true;
    }

    protected function getMemberByMMID($mmid)
    {
        try {
            return $this->memberDbConnection->table('members')
                ->where('mmid', $mmid)
                ->select(['id', 'name', 'email'])
                ->first();
        } catch (Exception $e) {
            Log::error('Error fetching member by MMID', [
                'mmid' => $mmid,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    protected function generateStatementData(
        Account $account, 
        $transactions, 
        $startDate, 
        $endDate, 
        $member
    ) {
        $openingBalance = $this->calculateOpeningBalance($account, $startDate);
        $closingBalance = $this->calculateClosingBalance($account, $endDate);

        $transactionData = $transactions->map(function ($transaction) {
            return [
                'date' => $transaction->created_at->format('Y-m-d H:i:s'),
                'reference' => $transaction->reference,
                'description' => $transaction->metadata['narrative'] ?? 'Transaction',
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'balance' => $transaction->metadata['new_balance'] ?? null,
                'payer_name' => $transaction->payer_name ?? null,
                'payment_method' => $transaction->payment_method ?? 'N/A'
            ];
        });

        return [
            'account' => [
                'name' => $member->name ?? $account->name,
                'reference' => $account->reference,
                'type' => $account->type,
            ],
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email
            ],
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'balances' => [
                'opening' => $openingBalance,
                'closing' => $closingBalance,
                'net_change' => $closingBalance - $openingBalance
            ],
            'transactions' => $transactionData,
            'summary' => [
                'total_credits' => $transactions->where('type', 'credit')->sum('amount'),
                'total_debits' => $transactions->where('type', 'debit')->sum('amount'),
                'transaction_count' => $transactions->count(),
                'credit_count' => $transactions->where('type', 'credit')->count(),
                'debit_count' => $transactions->where('type', 'debit')->count()
            ]
        ];
    }

    protected function sendStatementEmail(Account $account, $pdf, $statementData, $member)
    {
        Mail::to($member->email)->send(new DailyAccountStatement($account, $pdf, $statementData));
    }

    protected function calculateOpeningBalance(Account $account, $date)
    {
        return Transaction::where('account_id', $account->id)
            ->where('created_at', '<', $date)
            ->orderBy('created_at', 'desc')
            ->first()?->metadata['new_balance'] ?? 0;
    }

    protected function calculateClosingBalance(Account $account, $date)
    {
        return Transaction::where('account_id', $account->id)
            ->where('created_at', '<=', $date)
            ->orderBy('created_at', 'desc')
            ->first()?->metadata['new_balance'] ?? 0;
    }

    protected function generatePDF($statementData)
    {
        $pdf = PDF::loadView('pdfs.account-statement', $statementData);
        $pdf->setPaper('A4');
        $pdf->setOptions([
            'enable_php' => true,
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true
        ]);
        return $pdf;
    }
}