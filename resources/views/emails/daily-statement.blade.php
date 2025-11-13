<!-- resources/views/emails/daily-statement.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --primary-color: #3b82f6;
            --primary-dark: #2563eb;
            --primary-light: #93c5fd;
            --secondary-bg: #f3f4f6;
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
            --text-light: #6b7280;
            --success: #10b981;
            --danger: #ef4444;
            --border-radius: 12px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            max-width: 600px;
            margin: 0 auto;
            padding: 25px;
            background-color: #ffffff;
        }

        .email-container {
            border-radius: var(--border-radius);
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }

        .email-header {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            padding: 30px 25px;
            color: white;
            text-align: center;
        }

        .logo-container {
            margin-bottom: 20px;
        }

        .logo {
            max-width: 120px;
            height: auto;
        }

        .email-header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .email-header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .content-wrapper {
            padding: 30px 25px;
            background: white;
        }

        .account-card {
            background-color: var(--secondary-bg);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 25px;
        }

        .account-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }

        .detail-item {
            margin-bottom: 10px;
        }

        .detail-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-light);
            display: block;
            margin-bottom: 4px;
        }

        .detail-value {
            font-size: 16px;
            font-weight: 500;
            color: var(--text-primary);
        }

        .highlight {
            color: var(--primary-dark);
            font-weight: 600;
        }

        .summary-box {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 25px;
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

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .stat-box {
            background: var(--secondary-bg);
            padding: 15px;
            border-radius: 8px;
            transition: transform 0.2s ease;
        }

        .stat-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .credit {
            color: var(--success);
        }

        .debit {
            color: var(--danger);
        }

        .message {
            background-color: rgba(59, 130, 246, 0.05);
            border-left: 4px solid var(--primary-color);
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .cta-button {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            margin: 15px 0;
            text-align: center;
        }

        .footer {
            margin-top: 25px;
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: var(--text-light);
        }

        .social-links {
            margin: 15px 0;
            text-align: center;
        }

        .social-link {
            display: inline-block;
            margin: 0 5px;
            color: var(--primary-color);
            text-decoration: none;
        }

        @media screen and (max-width: 480px) {
            body {
                padding: 15px;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo-container">
                <!-- You can add your logo here -->
                 <img src="{{ asset('images/mout-logo.png') }}" class="logo" alt="Company Logo"> 
            </div>
            <h1>Daily Account Statement</h1>
            <p>Your financial summary for {{ $statementData['period']['start'] }}</p>
        </div>

        <div class="content-wrapper">
            <div class="account-card">
                <div class="account-details">
                    <div class="detail-item">
                        <span class="detail-label">Account Name</span>
                        <span class="detail-value highlight">{{ $account->name }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Reference</span>
                        <span class="detail-value">{{ $account->reference }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Statement Date</span>
                        <span class="detail-value">{{ $statementData['period']['start'] }}</span>
                    </div>
                </div>
            </div>

            <div class="summary-box">
                <h3 class="section-title">Daily Summary</h3>
                <div class="summary-grid">
                    <div class="stat-box">
                        <div class="stat-label">Opening Balance</div>
                        <div class="stat-value">{{ number_format($statementData['balances']['opening'], 2) }}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Closing Balance</div>
                        <div class="stat-value">{{ number_format($statementData['balances']['closing'], 2) }}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Total Credits</div>
                        <div class="stat-value credit">+{{ number_format($statementData['summary']['total_credits'], 2) }}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Total Debits</div>
                        <div class="stat-value debit">-{{ number_format($statementData['summary']['total_debits'], 2) }}</div>
                    </div>
                </div>
            </div>

            <div class="message">
                <p>Please find your detailed account statement attached to this email. You can also view your complete transaction history by logging into your account.</p>
            </div>

            <a href="#" class="cta-button">View Full Statement</a>

            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>For any queries, please contact our support team at <a href="mailto:support@example.com" style="color: var(--primary-color);">support@example.com</a></p>
                
                <div class="social-links">
                    <a href="#" class="social-link">Privacy Policy</a> | 
                    <a href="#" class="social-link">Terms of Service</a> | 
                    <a href="#" class="social-link">Unsubscribe</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>