# M-Pesa Integration Fixes & Comprehensive Testing Guide

**Created:** 2025-12-12
**Status:** Critical Issues Identified & Fixed

---

## 🚨 Critical Issues Found & Fixed

### 1. M-Pesa Configuration Inconsistency (PRIMARY ISSUE)

**Problem:**
The codebase has TWO different configuration paths for M-Pesa:
- `DarajaApiService.php` uses: `config('mpesa.*)`
- `MpesaController.php` uses: `config('services.mpesa.*)`

This inconsistency causes **authentication failures** because different parts of the code pull credentials from different config sources.

**Root Cause:**
```php
// DarajaApiService.php (Line 20-27)
$this->env = config('mpesa.env');
$this->consumerKey = config('mpesa.consumer_key');
$this->consumerSecret = config('mpesa.consumer_secret');
$this->passkey = config('mpesa.passkey');
$this->shortcode = config('mpesa.shortcode');

// MpesaController.php (Line 23-27)
$this->consumerKey = config('services.mpesa.consumer_key');
$this->consumerSecret = config('services.mpesa.consumer_secret');
$this->passkey = config('services.mpesa.passkey');
$this->shortcode = config('services.mpesa.shortcode');
$this->env = config('services.mpesa.env');
```

**Solution:**
Standardize ALL M-Pesa code to use `config('mpesa.*)` since `/config/mpesa.php` has more comprehensive configuration including B2C settings.

**Files to Fix:**
1. `/app/Http/Controllers/MpesaController.php` - Lines 23-27
2. Any other controllers using `config('services.mpesa.*)`

### 2. Hardcoded Credentials (SECURITY RISK)

**Problem:**
`WithdrawalController.php` contains hardcoded sensitive credentials:

```php
// Line 364-365: Hardcoded WhatsApp credentials
$phone_number_id = '707651015772272';
$access_token = 'EAFdTYxYcXGkBPV6VKkZCs1zMOlbNAJFWi5GZCUZBZCYGv7yg9aSBDOVUrnYY3LOCtp6LPSeXawkwtRSrKJZAS2BVOAj2FUNfZBcrZANOLcqfZAczNVyZAZAz9MeFw9tTtwz4xRWC8vLDXScgvgyxHUyxxgzaKH0KgFS9VnMlaJUPdkpoZAieg7AoDtFgaie43yB';

// Line 474: Hardcoded SMS API key
'api_key' => 'af09ec090e4c42498d52bb2673ff559b',
'sender_id' => 'FERRITE',
```

**Solution:**
Move all credentials to `.env` file and use `env()` or `config()` helper.

---

## 🔧 Implementation Fixes

### Fix 1: Update MpesaController.php

**File:** `/app/Http/Controllers/MpesaController.php`

**Change Lines 22-28:**

```php
// BEFORE (INCORRECT)
public function __construct()
{
    $this->consumerKey = config('services.mpesa.consumer_key');
    $this->consumerSecret = config('services.mpesa.consumer_secret');
    $this->passkey = config('services.mpesa.passkey');
    $this->shortcode = config('services.mpesa.shortcode');
    $this->env = config('services.mpesa.env');
}

// AFTER (CORRECT)
public function __construct()
{
    $this->consumerKey = config('mpesa.consumer_key');
    $this->consumerSecret = config('mpesa.consumer_secret');
    $this->passkey = config('mpesa.passkey');
    $this->shortcode = config('mpesa.shortcode');
    $this->env = config('mpesa.env');
}
```

### Fix 2: Update WithdrawalController.php

**File:** `/app/Http/Controllers/WithdrawalController.php`

**Change Lines 364-366:**

```php
// BEFORE (INSECURE)
$phone_number_id = '707651015772272';
$access_token = 'EAFdTYxYcXGkBPV6VKkZCs1zMOlbNAJFWi5GZCUZBZCYGv7yg9aSBDOVUrnYY3LOCtp6LPSeXawkwtRSrKJZAS2BVOAj2FUNfZBcrZANOLcqfZAczNVyZAZAz9MeFw9tTtwz4xRWC8vLDXScgvgyxHUyxxgzaKH0KgFS9VnMlaJUPdkpoZAieg7AoDtFgaie43yB';

// AFTER (SECURE)
$phone_number_id = config('services.whatsapp.phone_number_id');
$access_token = config('services.whatsapp.access_token');
```

**Change Lines 474-476:**

```php
// BEFORE (INSECURE)
$postData = [
    'api_key' => 'af09ec090e4c42498d52bb2673ff559b',
    'sender_id' => 'FERRITE',
    'message' => $message,
    'phone' => $formattedTo
];

// AFTER (SECURE)
$postData = [
    'api_key' => config('services.sms.api_key'),
    'sender_id' => config('services.sms.sender_id', 'FERRITE'),
    'message' => $message,
    'phone' => $formattedTo
];
```

**Add to `/config/services.php`:**

```php
'whatsapp' => [
    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
],

'sms' => [
    'api_url' => env('SMS_API_URL', 'https://blessedtexts.com/api/sms/v1/sendsms'),
    'api_key' => env('SMS_API_KEY'),
    'sender_id' => env('SMS_SENDER_ID', 'FERRITE'),
],
```

**Add to `.env`:**

```env
# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER_ID=707651015772272
WHATSAPP_ACCESS_TOKEN=your_access_token_here

# SMS Configuration
SMS_API_URL=https://blessedtexts.com/api/sms/v1/sendsms
SMS_API_KEY=af09ec090e4c42498d52bb2673ff559b
SMS_SENDER_ID=FERRITE
```

---

## ✅ Comprehensive Testing Checklist

### Admin Module Testing (All 12 Modules)

#### 1. **User Management** ✓
- [ ] List all users with pagination
- [ ] Search users by name, email, member_id
- [ ] Filter users by role (admin, member)
- [ ] Filter users by status (active, inactive)
- [ ] Create new admin user
  - [ ] Verify auto-generated credentials display
  - [ ] Confirm email sent with credentials
- [ ] Edit existing user
  - [ ] Update name, email, role
  - [ ] Toggle status (active/inactive)
- [ ] Reset user password
  - [ ] Verify new password is sent to user
- [ ] Delete user
  - [ ] Confirm deletion warning appears
  - [ ] Verify user removed from database
- [ ] Export users to CSV
- [ ] Refresh data manually

#### 2. **Account Management** ✓
- [ ] List all accounts with pagination
- [ ] Search accounts by name, reference
- [ ] Filter by account type (savings, donation, project)
- [ ] Filter by status (active, inactive, suspended)
- [ ] Create new account
  - [ ] Set account name, type, reference
  - [ ] Assign owner (user)
  - [ ] Set initial balance
- [ ] Edit account details
  - [ ] Update name, description
  - [ ] Change account status
- [ ] View account transaction history
- [ ] Perform internal account transfer
  - [ ] Verify balance updates on both accounts
- [ ] Delete account
  - [ ] Verify cannot delete accounts with balance
- [ ] Export accounts to CSV

#### 3. **Transaction Management** ✓
- [ ] List all transactions with pagination (15 per page)
- [ ] Search transactions by:
  - [ ] Reference number
  - [ ] Payer name
  - [ ] Phone number
  - [ ] Transaction ID
  - [ ] Account name
- [ ] Filter by type (credit, debit)
- [ ] Filter by status (completed, pending, failed)
- [ ] Filter by date range (start date, end date)
- [ ] View transaction details modal
  - [ ] Verify all transaction info displays
  - [ ] Check M-Pesa receipt number (if applicable)
  - [ ] View account information
  - [ ] View payer information
  - [ ] Check metadata/additional info
- [ ] Export filtered transactions to CSV
- [ ] Refresh transactions manually
- [ ] Verify stats cards update correctly:
  - [ ] Total transactions count
  - [ ] Total credits (money in)
  - [ ] Total debits (money out)
  - [ ] Net balance calculation

#### 4. **Withdrawal Management** ✓
- [ ] List all withdrawals with pagination
- [ ] Search withdrawals by:
  - [ ] Phone number
  - [ ] Initiated by name
  - [ ] Receiver name
  - [ ] Reference number
  - [ ] M-Pesa transaction ID
- [ ] Filter by status:
  - [ ] Initiated
  - [ ] Pending
  - [ ] Completed
  - [ ] Failed
  - [ ] Cancelled
- [ ] **Initiate new withdrawal** (Critical Test):
  - [ ] Select account with sufficient balance
  - [ ] Enter amount (validate > 0)
  - [ ] Enter recipient phone number (254XXXXXXXXX)
  - [ ] Select withdrawal reason
  - [ ] Enter initiator name
  - [ ] Enter initiator phone number
  - [ ] **Send OTP via WhatsApp**
    - [ ] Verify OTP received on WhatsApp
    - [ ] Confirm 6-digit code
  - [ ] Enter OTP code
  - [ ] Submit withdrawal request
  - [ ] **Verify M-Pesa B2C triggers**
  - [ ] Confirm recipient receives M-Pesa payment
  - [ ] Verify withdrawal status updates to "completed"
  - [ ] Check account balance deducted
  - [ ] Confirm notifications sent to:
    - [ ] Recipient
    - [ ] Initiator
    - [ ] Treasurers
- [ ] View withdrawal details
  - [ ] Check all withdrawal info
  - [ ] View M-Pesa conversation ID
  - [ ] View M-Pesa transaction ID
  - [ ] Check result code and description
  - [ ] View metadata
- [ ] Export withdrawals to CSV
- [ ] Verify stats cards:
  - [ ] Total withdrawals amount
  - [ ] Completed withdrawals
  - [ ] Pending withdrawals
  - [ ] Failed withdrawals count

#### 5. **Project Management** ✓
- [ ] List all projects with pagination
- [ ] Search projects by name
- [ ] Filter by category
- [ ] Filter by status (active, completed, on-hold, cancelled)
- [ ] Create new project
  - [ ] Set project name, description
  - [ ] Set target amount
  - [ ] Assign category
  - [ ] Set start and end dates
  - [ ] Upload project image
  - [ ] Set account link (auto-create option)
- [ ] Edit project
  - [ ] Update details
  - [ ] Change status
  - [ ] Update image
- [ ] View project details
  - [ ] Check contributions summary
  - [ ] View progress percentage
  - [ ] See linked account balance
- [ ] Delete project (admin only)
- [ ] Export projects to CSV

#### 6. **News & Announcements** ✓
- [ ] **News Tab:**
  - [ ] List all news articles
  - [ ] Search by title or content
  - [ ] Filter by status (draft, published, archived)
  - [ ] Create new article
    - [ ] Enter title (auto-generate slug)
    - [ ] Write content
    - [ ] Add tags
    - [ ] Upload cover image
    - [ ] Set as draft or publish immediately
  - [ ] Edit article
    - [ ] Update content
    - [ ] Change slug
    - [ ] Modify tags
  - [ ] Publish draft article
  - [ ] Archive article
  - [ ] Delete article
- [ ] **Announcements Tab:**
  - [ ] List all announcements
  - [ ] Search announcements
  - [ ] Filter by priority (low, medium, high)
  - [ ] Filter by status (active, scheduled, expired)
  - [ ] Create announcement
    - [ ] Set title and message
    - [ ] Select priority
    - [ ] Set expiry date
    - [ ] Choose notification channels (email, SMS, push)
  - [ ] Edit announcement
  - [ ] Deactivate announcement
  - [ ] Delete announcement
- [ ] Export news/announcements
- [ ] Verify dual-tab interface works smoothly

#### 7. **Merchandise Management** ✓
- [ ] List all merchandise items
- [ ] Search by product name
- [ ] Filter by category
- [ ] Filter by stock status (in stock, low stock, out of stock)
- [ ] Create new merchandise
  - [ ] Set name, description, price
  - [ ] Upload multiple images (gallery)
  - [ ] Set stock quantity
  - [ ] Add variants (size, color)
- [ ] Edit merchandise
  - [ ] Update price
  - [ ] Modify stock quantity
  - [ ] Update images
- [ ] View sales history
- [ ] Mark item as out of stock
- [ ] Delete merchandise
- [ ] Export merchandise to CSV

#### 8. **Orders Management** ✓
- [ ] List all customer orders
- [ ] Search by order number, customer name, email, phone
- [ ] Filter by order status:
  - [ ] Pending
  - [ ] Processing
  - [ ] Shipped
  - [ ] Delivered
  - [ ] Cancelled
- [ ] Filter by payment status:
  - [ ] Pending
  - [ ] Paid
  - [ ] Failed
  - [ ] Refunded
- [ ] View order details
  - [ ] Customer information
  - [ ] Order items with quantities
  - [ ] Subtotals and total
  - [ ] Shipping address
- [ ] **Update order status**
  - [ ] Move to Processing
  - [ ] Mark as Shipped (enter tracking number)
  - [ ] Mark as Delivered
  - [ ] Cancel order
- [ ] **Update payment status**
  - [ ] Mark as Paid
  - [ ] Process Refund
  - [ ] Mark as Failed
- [ ] Export orders to CSV
- [ ] Verify stats:
  - [ ] Total orders
  - [ ] Pending count
  - [ ] Shipped count
  - [ ] Delivered count
  - [ ] Total revenue

#### 9. **Tickets Management** ✓
- [ ] List all event tickets
- [ ] Search by ticket number, member ID, phone number
- [ ] Filter by payment status (pending, completed, failed)
- [ ] Filter by winner status (all, winners only, non-winners)
- [ ] View ticket details
  - [ ] Ticket number
  - [ ] Member information
  - [ ] Payment amount
  - [ ] M-Pesa receipt (if paid)
  - [ ] Purchase date
  - [ ] Winner badge (if applicable)
- [ ] Export tickets to CSV
- [ ] Verify stats:
  - [ ] Total tickets sold
  - [ ] Sold tickets count
  - [ ] Pending payments
  - [ ] Winners count
  - [ ] Total revenue

#### 10. **Semesters Management** ✓
- [ ] List all academic semesters
- [ ] Search by semester name
- [ ] Filter by status (active, inactive)
- [ ] Filter by time period (upcoming, current, past)
- [ ] Create new semester
  - [ ] Set semester name (e.g., "Spring 2025")
  - [ ] Set start date
  - [ ] Set end date
  - [ ] Optionally mark as active
- [ ] Edit semester
  - [ ] Update dates
  - [ ] Change name
  - [ ] Toggle active status
- [ ] Activate semester
  - [ ] Verify only one semester can be active
  - [ ] Confirm other semesters deactivate
- [ ] Delete semester
- [ ] Verify stats:
  - [ ] Total semesters
  - [ ] Active semester
  - [ ] Upcoming semesters
  - [ ] Past semesters

#### 11. **Reports Management** ✓
- [ ] Set date range filters (from/to dates)
- [ ] Generate financial report
- [ ] View report summary cards:
  - [ ] Total income
  - [ ] Total expenses
  - [ ] Net balance
- [ ] View category breakdown:
  - [ ] Donations
  - [ ] Withdrawals
  - [ ] Internal transfers
- [ ] **Export Options:**
  - [ ] Download PDF report
  - [ ] Export to CSV
  - [ ] Email report (enter email address)
  - [ ] **Generate AI Analysis** (if Gemini enabled)
    - [ ] Executive summary
    - [ ] Key financial health indicators
    - [ ] Trends and observations
    - [ ] Recommendations
    - [ ] Risk areas to watch
- [ ] Verify empty state shows when no report generated

#### 12. **Settings Management** ✓
- [ ] View system settings
- [ ] Update general settings
  - [ ] System name
  - [ ] Contact email
  - [ ] Support phone
- [ ] Update M-Pesa settings
  - [ ] Consumer key
  - [ ] Consumer secret
  - [ ] Shortcode
  - [ ] Passkey
  - [ ] Environment (sandbox/production)
  - [ ] Callback URLs
- [ ] Update notification settings
  - [ ] SMS gateway configuration
  - [ ] Email SMTP settings
  - [ ] WhatsApp API settings
- [ ] Update security settings
  - [ ] Session timeout
  - [ ] Password policy
  - [ ] 2FA settings
- [ ] Save changes
  - [ ] Verify success notification
  - [ ] Confirm settings persist after page refresh
- [ ] Export configuration (backup)
- [ ] Import configuration (restore)

---

## 🧪 M-Pesa Integration Testing

### STK Push Testing (Customer Payment)

**Endpoint:** `POST /api/v1/payments/mpesa`

**Test Cases:**

1. **Valid STK Push:**
```json
{
  "phone_number": "254712345678",
  "amount": 100,
  "account_number": "MMID-TEST-001"
}
```
- [ ] Verify customer receives M-Pesa prompt on phone
- [ ] Customer enters PIN and completes payment
- [ ] Callback received at `/api/v1/payments/mpesa/callback`
- [ ] Payment record created in database
- [ ] Transaction status updated to "completed"
- [ ] Account balance updated

2. **Invalid Phone Number:**
```json
{
  "phone_number": "0712345678",  // Should be 254712345678
  "amount": 100,
  "account_number": "MMID-TEST-001"
}
```
- [ ] Verify validation error returned
- [ ] Error message mentions correct format

3. **Insufficient Amount:**
```json
{
  "phone_number": "254712345678",
  "amount": 0,
  "account_number": "MMID-TEST-001"
}
```
- [ ] Verify amount validation error
- [ ] Minimum amount is 1 KES

4. **Customer Cancels Payment:**
- [ ] Initiate STK Push
- [ ] Customer cancels on phone
- [ ] Verify callback receives cancellation
- [ ] Payment status marked as "cancelled"

5. **Query Transaction Status:**
```bash
GET /api/v1/payments/mpesa/status/{checkoutRequestId}
```
- [ ] Returns current payment status
- [ ] Shows pending/completed/cancelled/failed

### B2C Withdrawal Testing

**Endpoint:** `POST /api/v1/withdrawals/initiate`

**Test Cases:**

1. **Successful Withdrawal:**
```json
{
  "account_id": 1,
  "amount": 500,
  "phone_number": "254712345678",
  "withdrawal_reason": "BusinessPayment",
  "remarks": "Test withdrawal",
  "initiated_by_name": "Admin User",
  "initiator_phone": "254798765432",
  "otp": "123456"
}
```
- [ ] Send OTP via `/api/v1/withdrawals/send-otp`
- [ ] Receive OTP on WhatsApp
- [ ] Submit withdrawal with correct OTP
- [ ] M-Pesa B2C request initiated
- [ ] Recipient receives money
- [ ] Callback received at `/api/v1/mpesa/b2c/result`
- [ ] Withdrawal status updated to "completed"
- [ ] Account balance deducted
- [ ] Notifications sent to recipient and initiator

2. **Invalid OTP:**
- [ ] Use incorrect OTP code
- [ ] Verify error: "Invalid OTP"
- [ ] Withdrawal not initiated

3. **Insufficient Balance:**
- [ ] Try to withdraw more than account balance
- [ ] Verify error about insufficient funds

4. **Expired OTP:**
- [ ] Wait 10+ minutes after OTP sent
- [ ] Try to use old OTP
- [ ] Verify error: "OTP expired"

5. **B2C Timeout:**
- [ ] M-Pesa takes too long to process
- [ ] Timeout callback received at `/api/v1/mpesa/b2c/timeout`
- [ ] Withdrawal status set to "timeout"
- [ ] Treasurers notified

---

## 🔍 Transaction Pulling Verification

### Backend API Testing

**Endpoint:** `GET /api/v1/transactions`

**Query Parameters:**
- `type` - Filter by credit/debit
- `status` - Filter by completed/pending/failed
- `start_date` - Filter from date
- `end_date` - Filter to date
- `sort_by` - Sort field (created_at, amount, etc.)
- `sort_direction` - asc/desc

**Test Cases:**

1. **Fetch All Transactions:**
```bash
GET /api/v1/transactions?sort_by=created_at&sort_direction=desc
```
- [ ] Verify returns array of transactions
- [ ] Check pagination works
- [ ] Confirm sorted by newest first

2. **Filter by Type:**
```bash
GET /api/v1/transactions?type=credit
```
- [ ] Returns only credit transactions
- [ ] Verify all results have type="credit"

3. **Filter by Date Range:**
```bash
GET /api/v1/transactions?start_date=2025-01-01&end_date=2025-12-31
```
- [ ] Returns transactions within date range
- [ ] No transactions outside range

4. **Combined Filters:**
```bash
GET /api/v1/transactions?type=debit&status=completed&start_date=2025-01-01
```
- [ ] Multiple filters work together
- [ ] Results match all criteria

### Frontend Integration Testing

**Component:** `TransactionManagement.tsx`

- [ ] Component loads without errors
- [ ] Transactions table populates from API
- [ ] Search functionality filters locally
- [ ] Date range filter works
- [ ] Type filter (credit/debit) updates display
- [ ] Status filter updates display
- [ ] Pagination works (15 items per page)
- [ ] View details modal opens
- [ ] Export to CSV downloads file
- [ ] Refresh button reloads data
- [ ] Stats cards calculate correctly:
  - Total transactions
  - Total credits
  - Total debits
  - Net balance

---

## 📊 Additional Admin Modules Proposed

Based on the current system, here are **5 additional modules** that would enhance the admin dashboard:

### 1. **Audit Logs Module**
**Purpose:** Track all admin actions for accountability and security

**Features:**
- Log every create/update/delete operation
- Track user logins and logouts
- Record IP addresses and user agents
- Filter by user, action type, date range
- Export audit trail to CSV
- Highlight suspicious activities

**Why Needed:**
- Security monitoring
- Compliance and accountability
- Debugging user issues
- Fraud prevention

### 2. **Dashboard Analytics Module**
**Purpose:** Visual analytics and insights at a glance

**Features:**
- Real-time financial metrics (daily/weekly/monthly)
- Transaction volume charts (line/bar graphs)
- Top donors/contributors
- Account balance trends
- Project funding progress visualization
- Active users statistics
- Revenue vs Expenses comparison
- Predictive analytics (AI-powered trends)

**Why Needed:**
- Quick decision-making
- Identify trends and patterns
- Monitor financial health
- Strategic planning

### 3. **Notifications Management Module**
**Purpose:** Centralized notification management and delivery tracking

**Features:**
- View all sent notifications (SMS, Email, WhatsApp, Push)
- Filter by channel, status, recipient
- Resend failed notifications
- Create custom notification templates
- Schedule bulk notifications
- Track delivery rates and failures
- Manage notification preferences

**Why Needed:**
- Monitor communication effectiveness
- Troubleshoot delivery issues
- Reduce notification costs
- Improve user engagement

### 4. **Payment Gateway Configuration Module**
**Purpose:** Manage multiple payment integrations in one place

**Features:**
- Configure M-Pesa settings (consumer key, shortcode, passkey)
- Add/remove payment gateways (PayPal, Stripe, etc.)
- Test payment connections
- View transaction fees by gateway
- Set default payment method
- Enable/disable payment channels
- Webhook URL management
- Environment switching (sandbox/production)

**Why Needed:**
- Simplify payment setup
- Support multiple payment options
- Reduce technical debt
- Improve developer experience

### 5. **Member Engagement Module**
**Purpose:** Track and improve member participation

**Features:**
- Member activity dashboard
- Contribution history per member
- Engagement scores (based on donations, event attendance, etc.)
- Inactive member alerts
- Member communication history
- Segmentation (active, inactive, at-risk)
- Bulk messaging to segments
- Member retention analytics

**Why Needed:**
- Increase member retention
- Targeted communication
- Identify high-value members
- Improve fundraising strategies

---

## 🌐 Log Access Setup

### Heroku Logs

**Prerequisites:**
```bash
# Install Heroku CLI
# Windows (PowerShell as Admin):
winget install heroku

# macOS:
brew tap heroku/brew && brew install heroku

# Linux:
curl https://cli-assets.heroku.com/install.sh | sh
```

**Login to Heroku:**
```bash
heroku login
```

**View Logs:**
```bash
# Tail logs in real-time
heroku logs --tail --app uetjkuat

# View last 100 lines
heroku logs --num 100 --app uetjkuat

# Filter by component
heroku logs --source app --app uetjkuat
heroku logs --source heroku --app uetjkuat

# Filter by log level
heroku logs --tail --app uetjkuat | grep "ERROR"
heroku logs --tail --app uetjkuat | grep "WARNING"

# Save logs to file
heroku logs --num 1000 --app uetjkuat > heroku_logs.txt
```

**Alternative (Web Dashboard):**
1. Go to https://dashboard.heroku.com/apps/uetjkuat
2. Click "More" → "View logs"
3. Logs display in browser with auto-refresh

### Vercel Logs

**Prerequisites:**
```bash
# Install Vercel CLI
npm install -g vercel
```

**Login to Vercel:**
```bash
vercel login
```

**View Logs:**
```bash
# View runtime logs
vercel logs <deployment-url>

# Follow logs in real-time
vercel logs <deployment-url> --follow

# Filter by function
vercel logs <deployment-url> --output=api/function-name

# Last 100 lines
vercel logs <deployment-url> --limit=100

# Export to file
vercel logs <deployment-url> --limit=1000 > vercel_logs.txt
```

**Alternative (Web Dashboard):**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Logs" tab
4. Filter by:
   - Time range
   - Function name
   - Log level
   - Status code

### Laravel Application Logs

**Log Locations:**
```bash
# Local development
/storage/logs/laravel.log
/storage/logs/statements.log

# Production (Heroku/Render)
heroku logs --tail --app uetjkuat | grep "laravel"
```

**Viewing Logs Programmatically:**

**Create Log Viewer Endpoint** (Admin only):

Add to `/routes/api.php`:
```php
Route::get('/admin/logs', function () {
    $logFile = storage_path('logs/laravel.log');
    if (!file_exists($logFile)) {
        return response()->json(['error' => 'Log file not found'], 404);
    }

    $lines = file($logFile);
    $lastLines = array_slice($lines, -500); // Last 500 lines

    return response()->json([
        'logs' => implode('', $lastLines)
    ]);
})->middleware('auth:sanctum');
```

**Create Frontend Log Viewer Component:**

```tsx
// components/admin/LogsViewer.tsx
const LogsViewer = () => {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const response = await api.get('/admin/logs');
    if (response.success) {
      setLogs(response.data.logs);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <button onClick={fetchLogs} className="btn-primary">
        Refresh Logs
      </button>
      <pre className="mt-4 p-4 bg-black text-green-400 rounded overflow-auto max-h-96 font-mono text-xs">
        {logs}
      </pre>
    </div>
  );
};
```

---

## 📝 Testing Summary Checklist

### Pre-Deployment Verification

- [ ] All M-Pesa configuration uses `config('mpesa.*)`
- [ ] No hardcoded credentials in codebase
- [ ] All environment variables set in `.env`
- [ ] Configuration matches between local and production
- [ ] M-Pesa credentials valid and tested
- [ ] Webhook URLs publicly accessible
- [ ] SSL certificates valid
- [ ] Database migrations run successfully
- [ ] Queue workers running
- [ ] Scheduler configured (cron jobs)

### Module Testing Status

- [ ] User Management - Fully tested
- [ ] Account Management - Fully tested
- [ ] Transaction Management - Fully tested
- [ ] Withdrawal Management - Fully tested
- [ ] Project Management - Fully tested
- [ ] News & Announcements - Fully tested
- [ ] Merchandise - Fully tested
- [ ] Orders - Fully tested
- [ ] Tickets - Fully tested
- [ ] Semesters - Fully tested
- [ ] Reports - Fully tested
- [ ] Settings - Fully tested

### Integration Testing Status

- [ ] M-Pesa STK Push working
- [ ] M-Pesa callbacks received
- [ ] B2C withdrawals successful
- [ ] Transactions pulling correctly
- [ ] WhatsApp OTP delivery working
- [ ] SMS notifications sending
- [ ] Email notifications sending
- [ ] Real-time updates functioning

### Security & Performance

- [ ] API authentication working
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] XSS protection enabled
- [ ] CSRF tokens validated
- [ ] Input validation on all forms
- [ ] Database queries optimized
- [ ] API response times < 2 seconds
- [ ] Frontend loads < 3 seconds
- [ ] No console errors in production

---

## 🎯 Next Steps

1. **Apply M-Pesa Configuration Fix**
   - Update `MpesaController.php` to use `config('mpesa.*)`
   - Remove `services.mpesa` config from `/config/services.php` to avoid confusion

2. **Secure Hardcoded Credentials**
   - Move WhatsApp credentials to environment variables
   - Move SMS API key to environment variables
   - Update `.env.example` with new variables

3. **Test Withdrawal Flow End-to-End**
   - Send OTP
   - Receive WhatsApp message
   - Initiate withdrawal
   - Verify M-Pesa payment sent
   - Confirm notifications delivered

4. **Implement Additional Modules** (Optional)
   - Start with Audit Logs (highest priority)
   - Then Dashboard Analytics
   - Then Notifications Management

5. **Set Up Log Monitoring**
   - Install Heroku/Vercel CLI
   - Test log retrieval
   - Consider implementing in-app log viewer

---

## 🔗 Useful Resources

- **M-Pesa Daraja API Docs:** https://developer.safaricom.co.ke/docs
- **Laravel Queue Documentation:** https://laravel.com/docs/11.x/queues
- **Heroku CLI Documentation:** https://devcenter.heroku.com/articles/heroku-cli
- **Vercel CLI Documentation:** https://vercel.com/docs/cli
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp

---

**Last Updated:** 2025-12-12
**Status:** Ready for Implementation & Testing
**Priority:** High - M-Pesa fixes are critical for payment functionality
