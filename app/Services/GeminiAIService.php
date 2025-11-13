<?php
// app/Services/GeminiAIService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Transaction;
use App\Models\Account;
use Carbon\Carbon;

class GeminiAIService
{
    protected $apiKey;
    protected $baseUrl;
    protected $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->model = config('services.gemini.model', 'gemini-2.0-flash-exp');
    }

    /**
     * Analyze transaction for fraud detection
     */
    public function analyzeFraudRisk(array $transactionData, array $userHistory = []): array
    {
        try {
            $prompt = $this->buildFraudDetectionPrompt($transactionData, $userHistory);
            
            $response = $this->callGeminiAPI($prompt, [
                'temperature' => 0.1, // Low temperature for consistent analysis
                'topK' => 1,
                'topP' => 0.1
            ]);

            return $this->parseFraudAnalysis($response);

        } catch (\Exception $e) {
            Log::error('Gemini fraud analysis failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionData['transaction_id'] ?? 'unknown'
            ]);
            
            // Return safe default on API failure
            return [
                'risk_level' => 'medium',
                'risk_score' => 0.5,
                'flags' => ['api_error'],
                'recommendations' => ['manual_review'],
                'confidence' => 0.0
            ];
        }
    }

    /**
     * Analyze payment patterns and user behavior
     */
    public function analyzePaymentPattern(string $phoneNumber, array $recentTransactions): array
    {
        try {
            $prompt = $this->buildPatternAnalysisPrompt($phoneNumber, $recentTransactions);
            
            $response = $this->callGeminiAPI($prompt, [
                'temperature' => 0.3,
                'topK' => 10,
                'topP' => 0.8
            ]);

            return $this->parsePatternAnalysis($response);

        } catch (\Exception $e) {
            Log::error('Gemini pattern analysis failed', [
                'error' => $e->getMessage(),
                'phone' => substr($phoneNumber, 0, 6) . 'XXX'
            ]);
            
            return [
                'pattern_type' => 'unknown',
                'regularity_score' => 0.5,
                'predicted_next_payment' => null,
                'insights' => ['Analysis unavailable due to API error']
            ];
        }
    }

    /**
     * Smart account matching for ambiguous references
     */
    public function smartAccountMatching(string $reference, string $payerName, array $availableAccounts): ?array
    {
        try {
            $prompt = $this->buildAccountMatchingPrompt($reference, $payerName, $availableAccounts);
            
            $response = $this->callGeminiAPI($prompt, [
                'temperature' => 0.2,
                'topK' => 5,
                'topP' => 0.5
            ]);

            return $this->parseAccountMatching($response);

        } catch (\Exception $e) {
            Log::error('Gemini account matching failed', [
                'error' => $e->getMessage(),
                'reference' => $reference
            ]);
            
            return null;
        }
    }

    /**
     * Detect anomalous transaction behavior
     */
    public function detectAnomalies(array $currentTransaction, array $historicalData): array
    {
        try {
            $prompt = $this->buildAnomalyDetectionPrompt($currentTransaction, $historicalData);
            
            $response = $this->callGeminiAPI($prompt, [
                'temperature' => 0.1,
                'topK' => 1,
                'topP' => 0.1
            ]);

            return $this->parseAnomalyDetection($response);

        } catch (\Exception $e) {
            Log::error('Gemini anomaly detection failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'is_anomaly' => false,
                'anomaly_score' => 0.0,
                'anomaly_types' => [],
                'confidence' => 0.0
            ];
        }
    }

    /**
     * Generate transaction insights and recommendations
     */
    public function generateTransactionInsights(array $accountData, array $transactions): array
    {
        try {
            $prompt = $this->buildInsightsPrompt($accountData, $transactions);
            
            $response = $this->callGeminiAPI($prompt, [
                'temperature' => 0.5,
                'topK' => 20,
                'topP' => 0.9
            ]);

            return $this->parseInsights($response);

        } catch (\Exception $e) {
            Log::error('Gemini insights generation failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'insights' => ['Insights unavailable'],
                'recommendations' => [],
                'trends' => []
            ];
        }
    }

    // Private helper methods

    private function callGeminiAPI(string $prompt, array $parameters = []): array
    {
        $url = "{$this->baseUrl}/models/{$this->model}:generateContent";
        
        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => array_merge([
                'temperature' => 0.3,
                'topK' => 10,
                'topP' => 0.8,
                'maxOutputTokens' => 1024,
            ], $parameters)
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->timeout(30)->post("{$url}?key={$this->apiKey}", $payload);

        if (!$response->successful()) {
            throw new \Exception("Gemini API request failed: " . $response->body());
        }

        $result = $response->json();
        
        if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception("Invalid Gemini API response format");
        }

        return $result;
    }

    private function buildFraudDetectionPrompt(array $transactionData, array $userHistory): string
    {
        return "You are a fraud detection expert analyzing a mobile money transaction.

TRANSACTION DATA:
- Amount: {$transactionData['amount']}
- Phone: " . substr($transactionData['phone_number'], 0, 6) . "XXX
- Time: {$transactionData['timestamp']}
- Account Reference: {$transactionData['account_reference']}
- Payer Name: {$transactionData['payer_name']}

USER HISTORY:
" . json_encode($userHistory, JSON_PRETTY_PRINT) . "

Analyze this transaction for fraud risk considering:
1. Amount patterns (unusually high/low)
2. Time patterns (unusual hours)
3. Frequency patterns
4. Account reference patterns
5. Name consistency
6. Geographic patterns (if available)

Respond in JSON format:
{
    \"risk_level\": \"low|medium|high|critical\",
    \"risk_score\": 0.0-1.0,
    \"flags\": [\"list of specific risk factors\"],
    \"recommendations\": [\"list of recommended actions\"],
    \"confidence\": 0.0-1.0,
    \"reasoning\": \"brief explanation\"
}";
    }

    private function buildPatternAnalysisPrompt(string $phoneNumber, array $recentTransactions): string
    {
        $maskedPhone = substr($phoneNumber, 0, 6) . 'XXX';
        
        return "Analyze payment patterns for user {$maskedPhone}.

RECENT TRANSACTIONS:
" . json_encode($recentTransactions, JSON_PRETTY_PRINT) . "

Identify:
1. Payment frequency patterns
2. Amount patterns
3. Time-of-day preferences
4. Day-of-week preferences
5. Account reference patterns
6. Seasonal patterns (if data spans months)

Respond in JSON format:
{
    \"pattern_type\": \"regular|irregular|sporadic|new_user\",
    \"regularity_score\": 0.0-1.0,
    \"typical_amount_range\": {\"min\": 0, \"max\": 0},
    \"preferred_times\": [\"morning|afternoon|evening|night\"],
    \"preferred_days\": [\"monday|tuesday|...\"],
    \"predicted_next_payment\": \"ISO date or null\",
    \"insights\": [\"list of behavioral insights\"]
}";
    }

    private function buildAccountMatchingPrompt(string $reference, string $payerName, array $accounts): string
    {
        return "You are helping match a payment to the correct account.

PAYMENT DETAILS:
- Reference: {$reference}
- Payer Name: {$payerName}

AVAILABLE ACCOUNTS:
" . json_encode($accounts, JSON_PRETTY_PRINT) . "

Find the best matching account considering:
1. Exact reference matches
2. Partial reference matches
3. Name similarities
4. Common abbreviations/variations
5. Business name patterns

Respond in JSON format:
{
    \"best_match\": {
        \"account_id\": \"id or null\",
        \"confidence\": 0.0-1.0,
        \"reasoning\": \"explanation\"
    },
    \"alternative_matches\": [
        {\"account_id\": \"id\", \"confidence\": 0.0-1.0, \"reasoning\": \"explanation\"}
    ],
    \"requires_manual_review\": true|false
}";
    }

    private function buildAnomalyDetectionPrompt(array $currentTransaction, array $historicalData): string
    {
        return "Detect anomalies in this transaction compared to historical patterns.

CURRENT TRANSACTION:
" . json_encode($currentTransaction, JSON_PRETTY_PRINT) . "

HISTORICAL DATA:
" . json_encode($historicalData, JSON_PRETTY_PRINT) . "

Look for anomalies in:
1. Transaction amount (unusually high/low)
2. Transaction timing (unusual time/day)
3. Transaction frequency (too frequent/infrequent)
4. Account patterns (new/unusual accounts)
5. Geographic patterns (if location data available)

Respond in JSON format:
{
    \"is_anomaly\": true|false,
    \"anomaly_score\": 0.0-1.0,
    \"anomaly_types\": [\"amount|timing|frequency|account|geographic\"],
    \"confidence\": 0.0-1.0,
    \"details\": \"explanation of detected anomalies\"
}";
    }

    private function buildInsightsPrompt(array $accountData, array $transactions): string
    {
        return "Generate business insights from account and transaction data.

ACCOUNT DATA:
" . json_encode($accountData, JSON_PRETTY_PRINT) . "

TRANSACTIONS:
" . json_encode($transactions, JSON_PRETTY_PRINT) . "

Provide insights on:
1. Revenue trends
2. Customer behavior patterns
3. Peak transaction times
4. Growth opportunities
5. Potential issues or risks

Respond in JSON format:
{
    \"insights\": [\"list of key insights\"],
    \"recommendations\": [\"list of actionable recommendations\"],
    \"trends\": {
        \"revenue\": \"increasing|decreasing|stable\",
        \"volume\": \"increasing|decreasing|stable\",
        \"customer_activity\": \"increasing|decreasing|stable\"
    },
    \"alerts\": [\"list of items requiring attention\"]
}";
    }

    private function parseFraudAnalysis(array $response): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'];
        $json = $this->extractJSON($text);
        
        return [
            'risk_level' => $json['risk_level'] ?? 'medium',
            'risk_score' => floatval($json['risk_score'] ?? 0.5),
            'flags' => $json['flags'] ?? [],
            'recommendations' => $json['recommendations'] ?? [],
            'confidence' => floatval($json['confidence'] ?? 0.5),
            'reasoning' => $json['reasoning'] ?? 'Analysis completed'
        ];
    }

    private function parsePatternAnalysis(array $response): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'];
        $json = $this->extractJSON($text);
        
        return [
            'pattern_type' => $json['pattern_type'] ?? 'unknown',
            'regularity_score' => floatval($json['regularity_score'] ?? 0.5),
            'typical_amount_range' => $json['typical_amount_range'] ?? ['min' => 0, 'max' => 0],
            'preferred_times' => $json['preferred_times'] ?? [],
            'preferred_days' => $json['preferred_days'] ?? [],
            'predicted_next_payment' => $json['predicted_next_payment'] ?? null,
            'insights' => $json['insights'] ?? []
        ];
    }

    private function parseAccountMatching(array $response): ?array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'];
        $json = $this->extractJSON($text);
        
        if (!isset($json['best_match'])) {
            return null;
        }
        
        return [
            'best_match' => $json['best_match'],
            'alternative_matches' => $json['alternative_matches'] ?? [],
            'requires_manual_review' => $json['requires_manual_review'] ?? false
        ];
    }

    private function parseAnomalyDetection(array $response): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'];
        $json = $this->extractJSON($text);
        
        return [
            'is_anomaly' => $json['is_anomaly'] ?? false,
            'anomaly_score' => floatval($json['anomaly_score'] ?? 0.0),
            'anomaly_types' => $json['anomaly_types'] ?? [],
            'confidence' => floatval($json['confidence'] ?? 0.0),
            'details' => $json['details'] ?? ''
        ];
    }

    private function parseInsights(array $response): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'];
        $json = $this->extractJSON($text);
        
        return [
            'insights' => $json['insights'] ?? [],
            'recommendations' => $json['recommendations'] ?? [],
            'trends' => $json['trends'] ?? [],
            'alerts' => $json['alerts'] ?? []
        ];
    }

    private function extractJSON(string $text): array
    {
        // Try to find JSON in the response
        if (preg_match('/\{.*\}/s', $text, $matches)) {
            $json = json_decode($matches[0], true);
            if ($json !== null) {
                return $json;
            }
        }
        
        // If no valid JSON found, return empty array
        Log::warning('Failed to extract JSON from Gemini response', ['text' => $text]);
        return [];
    }
}