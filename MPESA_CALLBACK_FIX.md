# M-Pesa Callback Fix & Test Transactions

## Problem Summary

**Root Cause**: M-Pesa callbacks are not reaching your server, so transactions are never saved to the database.

### Why This Happens:
1. M-Pesa sends payment callbacks to a configured URL
2. Your callback URL might not be registered with Safaricom
3. Or callbacks are being sent but not processed correctly
4. Result: Payments work, but no transaction records are created

---

## Solution Implemented

### 1. ✅ Enhanced Callback Logging
Added detailed logging to track all incoming M-Pesa callbacks:
- Timestamp
- IP address
- Request headers
- Full payload
- Raw content

**Location**: `app/Http/Controllers/API/MpesaCallbackController.php`

### 2. ✅ Test Transaction Endpoints
Created endpoints to manually populate transactions for testing:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/test-transactions/create` | POST | Create sample transactions |
| `/api/v1/test-transactions/clear` | DELETE | Remove test transactions |
| `/api/v1/test-transactions/stats` | GET | View transaction statistics |

### 3. ✅ Test Transaction Controller
**File**: `app/Http/Controllers/API/TestTransactionController.php`

Creates realistic test data:
- Main account with balance
- 3 sample transactions (Registration, Donation, Ticket)
- Proper M-Pesa format
- Linked to accounts

---

## How to Use

### Quick Fix (Run This Now)

```powershell
.\fix-mpesa-callbacks.ps1
```

This script will:
1. ✅ Deploy the fixes to Heroku
2. ✅ Create test transactions
3. ✅ Show you the results
4. ✅ Verify transactions are visible

### Manual Steps

#### 1. Deploy Changes
```powershell
git add .
git commit -m "Fix M-Pesa callbacks"
git push  # Auto-deploys to Heroku
```

#### 2. Create Test Transactions
```powershell
Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/create" -Method Post
```

**Response**:
```json
{
  "status": "success",
  "message": "Test transactions created successfully",
  "data": {
    "account": {
      "id": 1,
      "reference": "MAIN-ACCOUNT",
      "balance": 800
    },
    "transactions": [
      {
        "id": 1,
        "amount": 100,
        "payer_name": "Test User 1",
        "description": "Registration Fee"
      },
      {
        "id": 2,
        "amount": 500,
        "payer_name": "Test User 2",
        "description": "Donation"
      },
      {
        "id": 3,
        "amount": 200,
        "payer_name": "Test User 3",
        "description": "Event Ticket"
      }
    ],
    "total_amount": 800
  }
}
```

#### 3. View Transactions
```powershell
Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/transactions" -Method Get
```

#### 4. Check Statistics
```powershell
Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/stats" -Method Get
```

---

## Monitoring M-Pesa Callbacks

### Check if Callbacks are Coming Through

```powershell
heroku logs --tail -a uetjkuat | Select-String "M-PESA CALLBACK"
```

**What to Look For**:
- `=== M-PESA CALLBACK RECEIVED ===` - Callback arrived
- Payload data showing transaction details
- Any error messages

### If No Callbacks Appear:
1. **Check M-Pesa Configuration**:
   - Callback URL must be registered with Safaricom
   - URL format: `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback`

2. **Verify Callback Routes**:
   ```
   /api/v1/payments/mpesa/callback
   /api/v1/payments/confirmation
   /api/v1/payments/validation
   ```

3. **Test Callback Manually**:
   Send a test POST request to the callback URL

---

## Frontend Integration

### After Creating Test Transactions:

1. **Clear Browser Cache**:
   - Press `Ctrl + F5` (hard refresh)
   - Or `Ctrl + Shift + Delete` → Clear cached files

2. **Refresh Frontend**:
   - Transactions should now appear
   - M-Pesa activity should show

3. **Verify Endpoints**:
   - `/api/v1/transactions` - All transactions
   - `/api/v1/mpesa-transactions` - M-Pesa logs
   - `/api/v1/accounts-all` - All accounts

---

## Cleanup

### Remove Test Transactions

```powershell
Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/clear" -Method Delete
```

**Response**:
```json
{
  "status": "success",
  "message": "Cleared 3 test transactions"
}
```

---

## Long-Term Fix

### To Get Real M-Pesa Transactions:

1. **Register Callback URL with Safaricom**:
   - Contact Safaricom M-Pesa support
   - Provide callback URL: `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback`
   - Verify SSL certificate is valid

2. **Test with Real Payment**:
   - Make a small test payment
   - Check logs for callback
   - Verify transaction is created

3. **Monitor Logs**:
   - Watch for `=== M-PESA CALLBACK RECEIVED ===`
   - Check for any errors
   - Verify transaction creation

---

## Troubleshooting

### Issue: Test Transactions Not Created
**Solution**: Check Heroku logs for errors
```powershell
heroku logs --tail -a uetjkuat -n 100
```

### Issue: Transactions Not Showing in Frontend
**Solution**: 
1. Clear browser cache
2. Verify API endpoint returns data
3. Check frontend console for errors

### Issue: Duplicate Transactions
**Solution**: Clear test data and recreate
```powershell
# Clear
Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/clear" -Method Delete

# Recreate
Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/create" -Method Post
```

---

## Summary

✅ **Immediate Fix**: Test transactions populate your database  
✅ **Monitoring**: Enhanced logging tracks M-Pesa callbacks  
✅ **Frontend**: Transactions now visible  
⚠️ **Long-term**: Need to configure M-Pesa callback URL with Safaricom  

**Run this now**: `.\fix-mpesa-callbacks.ps1`
