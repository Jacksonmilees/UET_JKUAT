# 🔄 UET JKUAT Platform - Complete System Flow

## 📋 Table of Contents
1. [User Registration & Login Flow](#user-registration--login-flow)
2. [M-Pesa Payment Flows](#m-pesa-payment-flows)
3. [Withdrawal Flow](#withdrawal-flow)
4. [Ticket Purchase Flow](#ticket-purchase-flow)
5. [Account Management Flow](#account-management-flow)
6. [Transaction Flow](#transaction-flow)
7. [Reports Flow](#reports-flow)
8. [Member Management Flow](#member-management-flow)
9. [Admin Operations Flow](#admin-operations-flow)
10. [Timeline & Triggers](#timeline--triggers)

---

## 1. User Registration & Login Flow

### 📝 Registration Flow
**When**: New user wants to join the platform  
**Where**: `RegisterPage.tsx`  
**Duration**: ~2-3 minutes

```
START → User visits site
  ↓
1. User clicks "Register" (Header or Login page)
  ↓
2. RegisterPage.tsx loads
  ↓
3. User fills form:
   - Name, Email, Password
   - Phone Number (254XXXXXXXXX)
   - Year of Study, Course, College
   - Admission Number
   - Ministry Interest
   - Residence
  ↓
4. User clicks "Create Account & Pay KES 100 →"
  ↓
5. BACKEND: POST /api/auth/register
   - Creates user account
   - Returns user + token
   - Sets user state in AuthContext
  ↓
6. USER IS NOW LOGGED IN ✅
  ↓
7. MandatoryPaymentModal opens automatically
  ↓
8. User enters phone number (pre-filled)
  ↓
9. Clicks "Pay KES 100"
  ↓
10. BACKEND: POST /v1/payments/mpesa
    - Initiates STK Push
    - Returns CheckoutRequestID
  ↓
11. MpesaPaymentStatus component polls status
    - Every 3 seconds for 2 minutes
    - BACKEND: GET /v1/payments/mpesa/status/{checkoutRequestID}
  ↓
12. User receives STK Push on phone
  ↓
13. User enters M-Pesa PIN
  ↓
14. M-Pesa processes payment
  ↓
15. BACKEND: M-Pesa callback → /v1/payments/mpesa/callback
    - Updates payment status
    - Creates ticket
    - Credits account
  ↓
16. Frontend detects "completed" status
  ↓
17. Modal shows success ✅
  ↓
18. Redirects to Dashboard
  ↓
END → User on Dashboard, fully registered & paid
```

**Key Points**:
- ✅ User is logged in BEFORE payment
- ✅ Payment is tracked separately
- ✅ User can access dashboard even if payment pending
- ✅ Mandatory contribution status checked on login

---

## 2. M-Pesa Payment Flows

### 💳 A. Project Contribution Flow
**When**: User wants to donate to a project  
**Where**: `ProjectDetailPage.tsx` → `ContributionModal.tsx`  
**Duration**: ~1-2 minutes

```
START → User on Project Detail Page
  ↓
1. User clicks "Contribute Now 💝"
  ↓
2. ContributionModal opens
  ↓
3. User enters:
   - Amount (KES)
   - Phone Number
   - Name (optional)
  ↓
4. Clicks "Contribute"
  ↓
5. BACKEND: POST /v1/payments/mpesa
   - account_number: "PROJECT-{projectId}"
  ↓
6. STK Push sent to phone
  ↓
7. MpesaPaymentStatus polls
  ↓
8. User enters PIN on phone
  ↓
9. M-Pesa callback updates status
  ↓
10. Success → Shows confirmation
  ↓
11. Creates donation record
  ↓
12. Updates project currentAmount
  ↓
END → Contribution recorded
```

### 💳 B. Merchandise Purchase Flow
**When**: User checks out cart  
**Where**: `CartPage.tsx`  
**Duration**: ~1-2 minutes

```
START → User on Cart Page with items
  ↓
1. User clicks "Proceed to Checkout 🚀"
  ↓
2. If not logged in → Redirect to Login
  ↓
3. If logged in → Initiate payment
  ↓
4. BACKEND: POST /v1/payments/mpesa
   - account_number: "ORDER-{orderId}"
   - amount: cartTotal
  ↓
5. STK Push sent
  ↓
6. User pays on phone
  ↓
7. Callback updates order status
  ↓
8. Creates order record
  ↓
9. Clears cart
  ↓
10. Redirects to Dashboard
  ↓
END → Order placed, items reserved
```

---

## 3. Withdrawal Flow

### 💸 Withdrawal Request Flow
**When**: Admin/Treasurer needs to withdraw funds  
**Where**: Admin Dashboard → `WithdrawalManagement.tsx`  
**Duration**: ~3-5 minutes (includes OTP)

```
START → Admin on Withdrawal Management
  ↓
1. Admin clicks "+ New Withdrawal"
  ↓
2. WithdrawalModal opens (Step 1: Form)
  ↓
3. Admin fills:
   - Account (dropdown of available accounts)
   - Amount (KES)
   - Recipient Phone (254XXXXXXXXX)
   - Withdrawal Reason (Business/Salary/Promotion)
   - Initiated By Name
   - Initiator Phone (for OTP)
   - Remarks (optional)
  ↓
4. Admin clicks "Send OTP"
  ↓
5. BACKEND: POST /v1/withdrawals/send-otp
   - phone_number: initiator_phone
  ↓
6. BACKEND sends OTP via WhatsApp
   - Uses WhatsApp template
   - OTP cached for 10 minutes
  ↓
7. Modal switches to Step 2: OTP Entry
  ↓
8. Admin receives WhatsApp message with 6-digit OTP
  ↓
9. Admin enters OTP in modal
  ↓
10. Admin clicks "Complete Withdrawal"
  ↓
11. BACKEND: POST /v1/withdrawals/initiate
    - Validates OTP
    - Creates withdrawal record (status: initiated)
    - Calls M-Pesa B2C API
    - Updates status to pending
  ↓
12. M-Pesa processes B2C transaction
  ↓
13. BACKEND: Callback → /v1/withdrawals/b2c-callback
    - Updates status to completed/failed
  ↓
14. Notifications sent:
    - SMS to recipient
    - SMS to initiator
    - WhatsApp to treasurers
  ↓
15. Frontend refreshes withdrawal list
  ↓
16. Status shows: completed ✅
  ↓
END → Funds sent to recipient's M-Pesa
```

**Status Progression**:
- `initiated` → Just created
- `pending` → M-Pesa request sent
- `completed` → Money sent successfully
- `failed` → Transaction failed
- `timeout` → Request timed out

**Key Security**:
- ✅ OTP verification required
- ✅ WhatsApp delivery for security
- ✅ Treasurer notifications
- ✅ Audit trail in metadata

---

## 4. Ticket Purchase Flow

### 🎫 Ticket Purchase Flow
**When**: User wants to buy fundraising tickets  
**Where**: `TicketPurchase.tsx` (to be created)  
**Duration**: ~2-3 minutes

```
START → User visits ticket page
  ↓
1. User enters Member MMID or scans QR
  ↓
2. BACKEND: GET /api/tickets/{mmid}
   - Loads member details
  ↓
3. Purchase form displays:
   - Member Name (from MMID)
   - Buyer Name (who's buying)
   - Buyer Contact
   - Amount (KES)
   - Phone Number (for payment)
  ↓
4. User fills form and clicks "Purchase Ticket"
  ↓
5. BACKEND: POST /api/tickets/{mmid}/process
   - Generates ticket number: TKT-{mmid}-{random}
   - Initiates STK Push
   - Creates ticket record (status: pending)
  ↓
6. STK Push sent to phone
  ↓
7. User pays on phone
  ↓
8. M-Pesa callback updates ticket
  ↓
9. BACKEND updates:
   - Ticket status: completed
   - Credits member wallet
  ↓
10. SMS sent to buyer:
    "Your ticket {number} purchased for {amount} KES"
  ↓
11. SMS sent to member:
    "Ticket sold! {amount} KES credited to your wallet"
  ↓
12. Frontend polls: GET /api/tickets/check-payment-status/{ticketNumber}
  ↓
13. Shows success with ticket number
  ↓
END → Ticket purchased, wallet credited
```

### 🏆 Winner Selection Flow
**When**: Admin wants to select raffle winner  
**Where**: Admin Dashboard → `TicketManagement.tsx`  
**Duration**: ~1 minute

```
START → Admin on Ticket Management
  ↓
1. Admin clicks "Select Winner"
  ↓
2. BACKEND: GET /v1/tickets/completed/all
   - Loads all completed tickets
  ↓
3. Displays:
   - Total tickets sold
   - Total amount raised
   - Top 5 sellers leaderboard
   - All ticket entries
  ↓
4. Admin clicks "Draw Winner 🎲"
  ↓
5. BACKEND: POST /api/winner-selection
   - Randomly selects ticket
   - Updates ticket status: winner
  ↓
6. Confetti animation 🎉
  ↓
7. Winner details displayed:
   - Ticket Number
   - Buyer Name
   - Amount
   - Member who sold it
  ↓
8. SMS sent to winner:
    "Congratulations! You won with ticket {number}!"
  ↓
END → Winner selected and notified
```

---

## 5. Account Management Flow

### 💼 Account Creation Flow
**When**: Admin needs to create new account  
**Where**: Admin Dashboard → `AccountManagement.tsx`  
**Duration**: ~1-2 minutes

```
START → Admin on Account Management
  ↓
1. Admin clicks "+ Create Account"
  ↓
2. Modal opens with form:
   - Account Type (dropdown)
   - Account Subtype (filtered by type)
   - Account Name
   - Parent Account (optional)
   - Initial Balance (optional)
   - Metadata (JSON, optional)
  ↓
3. Admin fills form
  ↓
4. Clicks "Create Account"
  ↓
5. BACKEND: POST /v1/accounts
   - Generates unique reference
   - Creates account record
   - Sets status: active
  ↓
6. Account appears in list
  ↓
END → New account created
```

### 💱 Account Transfer Flow
**When**: Admin transfers funds between accounts  
**Where**: `AccountManagement.tsx` → Transfer Modal  
**Duration**: ~2-3 minutes

```
START → Admin clicks "Transfer Funds"
  ↓
1. Transfer modal opens
  ↓
2. Admin enters:
   - Source Account (dropdown/search)
   - Destination Account (dropdown/search)
   - Amount (KES)
   - Description
  ↓
3. Clicks "Validate Transfer"
  ↓
4. BACKEND: POST /v1/accounts/validate-transfer
   - Checks source balance
   - Validates account types
   - Confirms accounts active
  ↓
5. Shows validation result:
   - Source: {name} - Balance: {amount}
   - Destination: {name}
   - Transfer: {amount}
  ↓
6. Admin confirms
  ↓
7. BACKEND: POST /v1/accounts/transfer
   - Debits source account
   - Credits destination account
   - Creates transaction records (2)
   - Updates balances
  ↓
8. Success message shown
  ↓
9. Both accounts updated in UI
  ↓
END → Transfer completed
```

---

## 6. Transaction Flow

### 📊 Transaction Viewing Flow
**When**: Admin/User views transaction history  
**Where**: `TransactionManagement.tsx` or Dashboard  
**Duration**: Instant

```
START → User/Admin opens transactions
  ↓
1. BACKEND: GET /v1/transactions?filters
   - account_id (optional)
   - from_date (optional)
   - to_date (optional)
   - type (optional)
   - status (optional)
  ↓
2. Transactions displayed in table:
   - Date & Time
   - Type (credit/debit/donation/withdrawal)
   - Account
   - Amount
   - Status
   - Reference
   - Description
  ↓
3. User can:
   - Filter by date range
   - Filter by account
   - Filter by type
   - Search by reference
   - Export to CSV/PDF
  ↓
4. Click transaction → Detail modal opens
  ↓
5. Shows full transaction details:
   - All metadata
   - Related accounts
   - M-Pesa receipt (if applicable)
   - Timestamps
  ↓
END → Transaction details viewed
```

---

## 7. Reports Flow

### 📈 Finance Report Generation Flow
**When**: Admin needs financial reports  
**Where**: Admin Dashboard → `ReportsManagement.tsx`  
**Duration**: ~1-2 minutes

```
START → Admin on Reports Dashboard
  ↓
1. Admin selects:
   - Report Type: Finance
   - Date Range: From - To
   - Account Filter (optional)
   - Group By: Day/Week/Month
  ↓
2. Clicks "Generate Report"
  ↓
3. BACKEND: GET /v1/reports/finance?params
   - Aggregates transactions
   - Calculates totals
   - Groups by period
  ↓
4. Report displays:
   - Total Income
   - Total Expenses
   - Net Balance
   - By Category breakdown
   - Charts/Graphs
   - Transaction list
  ↓
5. Admin can:
   A. Download PDF
      → BACKEND: GET /v1/reports/finance/pdf
      → Downloads formatted PDF
   
   B. Email Report
      → Modal opens for email
      → BACKEND: POST /v1/reports/finance/email
      → Sends to specified emails
   
   C. Export CSV
      → Downloads raw data
  ↓
END → Report generated/downloaded/emailed
```

---

## 8. Member Management Flow

### 👥 Member Directory Flow
**When**: Admin manages members  
**Where**: Admin Dashboard → `MemberDirectory.tsx`  
**Duration**: Varies

```
START → Admin on Member Management
  ↓
1. BACKEND: GET /v1/members
   - Loads all members
  ↓
2. Member grid displays:
   - MMID
   - Name
   - WhatsApp
   - Wallet Balance
   - Total Tickets Sold
   - Status
  ↓
3. Admin can:
   
   A. Search Members
      → Type in search box
      → BACKEND: GET /v1/members/search?q={query}
      → Filters results
   
   B. View Member Profile
      → Click member card
      → BACKEND: GET /v1/members/{mmid}
      → Shows full details:
         - Personal info
         - Wallet transactions
         - Tickets sold
         - Performance stats
   
   C. Update Member
      → Click edit
      → Modal with form
      → BACKEND: PUT /v1/members/{mmid}
      → Updates member data
   
   D. View Member Wallet
      → Shows balance
      → Transaction history
      → Withdrawal requests
  ↓
END → Member managed
```

---

## 9. Admin Operations Flow

### 🔐 User Role Management
**When**: Super admin manages user roles  
**Where**: Admin Dashboard → `UserManagement.tsx`  
**Duration**: ~30 seconds per user

```
START → Admin on User Management
  ↓
1. BACKEND: GET /v1/users
   - Loads all users
  ↓
2. User list displays:
   - Name, Email
   - Role (user/admin/super_admin)
   - Status (active/inactive)
   - Registration Date
  ↓
3. Admin actions:
   
   A. Toggle Role
      → Click role badge
      → BACKEND: POST /v1/users/{id}/toggle-role
      → Cycles: user → admin → super_admin → user
      → Updates immediately
   
   B. Toggle Status
      → Click status badge
      → BACKEND: POST /v1/users/{id}/toggle-status
      → Toggles: active ↔ inactive
      → Inactive users can't login
   
   C. View User Details
      → Click user row
      → Shows full profile
      → Transaction history
      → Activity log
   
   D. Delete User
      → Click delete (with confirmation)
      → BACKEND: DELETE /v1/users/{id}
      → Soft delete (keeps records)
  ↓
END → User role/status updated
```

---

## 10. Timeline & Triggers

### ⏰ Automatic Processes

#### Daily (Midnight)
```
00:00 → Cron Job Triggers
  ↓
- Check expired tickets
- Update account balances
- Generate daily reports
- Send reminder emails
- Clean up old sessions
```

#### Real-time (On Event)
```
M-Pesa Callback Received
  ↓
- Update payment status
- Create transaction
- Credit account
- Send notifications
- Update project totals
  ↓
All happens in < 1 second
```

#### Polling (Frontend)
```
Every 3 seconds (during payment):
- Check M-Pesa status
- Update UI
- Show progress

Every 30 seconds (dashboard):
- Refresh stats
- Check new transactions
- Update notifications
```

---

## 📱 User Journey Examples

### Example 1: New Student Joins
```
Day 1, 10:00 AM → Student visits site
10:02 AM → Registers account
10:03 AM → Pays KES 100 (M-Pesa)
10:04 AM → On dashboard, sees projects
10:10 AM → Contributes KES 500 to project
10:11 AM → Receives confirmation SMS
10:15 AM → Browses merchandise
10:20 AM → Adds items to cart
10:22 AM → Checks out (KES 1,200)
10:23 AM → Pays via M-Pesa
10:24 AM → Order confirmed
```

### Example 2: Admin Daily Routine
```
Day 1, 9:00 AM → Admin logs in
9:01 AM → Checks overnight transactions
9:05 AM → Reviews pending withdrawals
9:10 AM → Approves 3 withdrawals (with OTP)
9:20 AM → Checks ticket sales
9:25 AM → Views finance report
9:30 AM → Downloads PDF report
9:35 AM → Emails report to treasurer
9:40 AM → Updates member status
9:45 AM → Logs out
```

### Example 3: Fundraising Event
```
Event Day, 2:00 PM → Event starts
2:05 PM → Members start selling tickets
2:10 PM → First ticket sold (M-Pesa)
2:11 PM → Member wallet credited
2:15 PM → 10 tickets sold
2:30 PM → 50 tickets sold
3:00 PM → 100 tickets sold
4:00 PM → Event ends
4:05 PM → Admin views sales report
4:10 PM → Admin selects winner
4:11 PM → Winner notified via SMS
4:15 PM → Top 5 sellers announced
```

---

## 🔄 Data Flow Summary

```
USER INPUT
    ↓
FRONTEND (React)
    ↓
API SERVICE (api.ts)
    ↓
BACKEND (Laravel)
    ↓
DATABASE (MySQL)
    ↓
EXTERNAL APIs (M-Pesa, WhatsApp)
    ↓
CALLBACKS
    ↓
BACKEND UPDATES
    ↓
FRONTEND POLLS/REFRESHES
    ↓
UI UPDATES
    ↓
USER SEES RESULT
```

---

## ⚡ Performance Expectations

| Operation | Expected Time |
|-----------|--------------|
| Page Load | < 2 seconds |
| API Call | < 500ms |
| M-Pesa STK Push | 5-30 seconds |
| M-Pesa Callback | 1-60 seconds |
| OTP Delivery | 5-15 seconds |
| Report Generation | 1-5 seconds |
| Search | < 200ms |
| Filter | < 100ms |

---

## 🎯 Success Criteria

### For Users:
- ✅ Register in < 3 minutes
- ✅ Pay via M-Pesa smoothly
- ✅ See transactions immediately
- ✅ Get SMS confirmations
- ✅ Access dashboard anytime

### For Admins:
- ✅ Process withdrawals securely
- ✅ Generate reports quickly
- ✅ Manage users easily
- ✅ Track all transactions
- ✅ Monitor system health

---

**Last Updated**: November 27, 2025, 11:10 AM  
**Status**: Complete Flow Documentation ✅  
**Next**: Implement remaining components following these flows  

**Built with ❤️ for UET JKUAT Ministry**
