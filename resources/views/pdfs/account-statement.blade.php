<!-- resources/views/pdfs/account-statement.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        :root {
            --primary-color: #3b82f6;
            --secondary-color: #f3f4f6;
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
            --text-light: #6b7280;
            --success: #10b981;
            --danger: #ef4444;
            --border-radius: 12px;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif;
            color: var(--text-primary);
            line-height: 1.6;
            padding: 30px;
            background-color: #ffffff;
        }

        .document-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }

        .header {
            padding: 40px 30px;
            background: linear-gradient(135deg, var(--primary-color), #2563eb);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-content h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .header-content p {
            font-size: 14px;
            opacity: 0.9;
        }

        .company-logo {
            max-width: 140px;
            height: auto;
        }

        .content-wrapper {
            padding: 30px;
        }

        .section {
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--text-primary);
            position: relative;
            padding-bottom: 8px;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background-color: var(--primary-color);
            border-radius: 3px;
        }

        .account-info {
            background: var(--secondary-color);
            border-radius: var(--border-radius);
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .info-group {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-light);
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 16px;
            font-weight: 500;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }

        .summary-box {
            background: white;
            border-radius: var(--border-radius);
            padding: 20px;
            text-align: center;
            box-shadow: var(--shadow);
            transition: transform 0.2s ease;
        }

        .summary-box h4 {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-light);
            margin-bottom: 8px;
        }

        .summary-box p {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .transactions-container {
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }

        .transactions-table {
            width: 100%;
            border-collapse: collapse;
        }

        .transactions-table th {
            background: var(--secondary-color);
            font-weight: 600;
            font-size: 14px;
            color: var(--text-secondary);
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .transactions-table td {
            padding: 12px 15px;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
        }

        .transactions-table tr:last-child td {
            border-bottom: none;
        }

        .transactions-table tr:hover {
            background-color: rgba(59, 130, 246, 0.05);
        }

        .credit {
            color: var(--success);
            font-weight: 500;
        }

        .debit {
            color: var(--danger);
            font-weight: 500;
        }

        .footer {
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: var(--text-light);
            text-align: center;
        }

        .footer p {
            margin-bottom: 8px;
        }

        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .document-container {
                box-shadow: none;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="header-content">
                <h1>Daily Account Statement</h1>
                <p>Financial summary for your records</p>
            </div>
            <img src="{{ asset('images/mout-logo.png') }}" class="company-logo">
        </div>

        <div class="content-wrapper">
            <div class="section">
                <h2 class="section-title">Account Information</h2>
                <div class="account-info">
                    <div class="info-group">
                        <span class="info-label">Account Name</span>
                        <span class="info-value">{{ $account['name'] }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Reference</span>
                        <span class="info-value">{{ $account['reference'] }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Statement Date</span>
                        <span class="info-value">{{ $period['start'] }}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Summary</h2>
                <div class="summary-grid">
                    <div class="summary-box">
                        <h4>Opening Balance</h4>
                        <p>{{ number_format($balances['opening'], 2) }}</p>
                    </div>
                    <div class="summary-box">
                        <h4>Total Transactions</h4>
                        <p>{{ $summary['transaction_count'] }}</p>
                    </div>
                    <div class="summary-box">
                        <h4>Closing Balance</h4>
                        <p>{{ number_format($balances['closing'], 2) }}</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Transaction Details</h2>
                <div class="transactions-container">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Reference</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($transactions as $transaction)
                            <tr>
                                <td>{{ $transaction['date'] }}</td>
                                <td>{{ $transaction['reference'] }}</td>
                                <td>{{ $transaction['description'] }}</td>
                                <td>{{ ucfirst($transaction['type']) }}</td>
                                <td class="{{ $transaction['type'] }}">
                                    {{ number_format($transaction['amount'], 2) }}
                                </td>
                                <td>{{ number_format($transaction['balance'], 2) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="footer">
                <p>This statement is computer generated and does not require a signature.</p>
                <p>For any queries, please contact our support team at support@example.com</p>
            </div>
        </div>
    </div>
</body>
</html>