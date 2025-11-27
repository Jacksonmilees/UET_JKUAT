# 🔍 BACKEND-FRONTEND MAPPING AUDIT

## ✅ **COMPLETE ENDPOINT VERIFICATION**

**Date**: November 27, 2025, 12:41 PM  
**Status**: Checking all backend routes against frontend API service  

---

## 📊 **BACKEND ROUTES vs FRONTEND API**

### **1. AUTHENTICATION** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| POST `/auth/register` | `authApi.register()` | ✅ Mapped |
| POST `/auth/login` | `authApi.login()` | ✅ Mapped |
| GET `/auth/me` | `authApi.me()` | ✅ Mapped |
| GET `/auth/mandatory-contribution` | ❌ Missing | ⚠️ **UNMAPPED** |

**Missing**: `authApi.getMandatoryContribution()`

---

### **2. PROJECTS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/projects` | `projectsApi.getAll()` | ✅ Mapped |
| GET `/v1/projects/{id}` | `projectsApi.getById()` | ✅ Mapped |
| POST `/v1/projects` | `projectsApi.create()` | ✅ Mapped |
| PUT `/v1/projects/{id}` | `projectsApi.update()` | ✅ Mapped |
| DELETE `/v1/projects/{id}` | `projectsApi.delete()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **3. ACCOUNTS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/accounts` | `accountsApi.getAll()` | ✅ Mapped |
| POST `/v1/accounts` | `accountsApi.create()` | ✅ Mapped |
| GET `/v1/accounts/{id}` | `accountsApi.getById()` | ✅ Mapped |
| PUT `/v1/accounts/{id}` | `accountsApi.update()` | ✅ Mapped |
| DELETE `/v1/accounts/{id}` | `accountsApi.delete()` | ✅ Mapped |
| POST `/v1/accounts/transfer` | `accountsApi.transfer()` | ✅ Mapped |
| POST `/v1/accounts/search` | `accountsApi.search()` | ✅ Mapped |
| POST `/v1/accounts/validate-transfer` | `accountsApi.validateTransfer()` | ✅ Mapped |
| GET `/v1/account-types` | `accountsApi.getTypes()` | ✅ Mapped |
| GET `/v1/account-subtypes` | `accountsApi.getSubtypes()` | ✅ Mapped |
| GET `/v1/accounts/{account}/transactions` | ❌ Missing | ⚠️ **UNMAPPED** |
| POST `/v1/create-account` | ❌ Missing | ⚠️ **UNMAPPED** |
| POST `/v1/accounts/check` | ❌ Missing | ⚠️ **UNMAPPED** |

**Missing**: 
- `accountsApi.getTransactions(accountId)`
- `accountsApi.createAccount()` (different from create)
- `accountsApi.checkAccount()`

---

### **4. TRANSACTIONS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/transactions` | `transactionsApi.getAll()` | ✅ Mapped |
| GET `/v1/transactions/{id}` | ❌ Missing | ⚠️ **UNMAPPED** |
| GET `/v1/accounts/{reference}/transactions` | ❌ Missing | ⚠️ **UNMAPPED** |

**Missing**:
- `transactionsApi.getById(id)`
- `transactionsApi.getByAccount(reference)`

---

### **5. WITHDRAWALS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| POST `/v1/withdrawals/initiate` | `withdrawalsApi.initiate()` | ✅ Mapped |
| GET `/v1/withdrawals` | `withdrawalsApi.getAll()` | ✅ Mapped |
| GET `/v1/withdrawals/{id}` | `withdrawalsApi.getById()` | ✅ Mapped |
| POST `/v1/withdrawals/send-otp` | `withdrawalsApi.sendOTP()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **6. TICKETS** ⚠️

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/tickets/my` | `ticketsApi.getMyTickets()` | ✅ Mapped |
| GET `/v1/tickets/completed/all` | `ticketsApi.getAllCompleted()` | ✅ Mapped |
| GET `/tickets/{mmid}` | ❌ Missing | ⚠️ **UNMAPPED** |
| POST `/tickets/{mmid}/process` | ❌ Missing | ⚠️ **UNMAPPED** |
| GET `/tickets/check-payment-status/{ticketNumber}` | ❌ Missing | ⚠️ **UNMAPPED** |
| GET `/tickets/completed/{mmid}` | ❌ Missing | ⚠️ **UNMAPPED** |
| POST `/winner-selection` | `ticketsApi.selectWinner()` | ✅ Mapped |

**Missing**:
- `ticketsApi.getByMMID(mmid)`
- `ticketsApi.processPurchase(mmid, data)`
- `ticketsApi.checkPaymentStatus(ticketNumber)`
- `ticketsApi.getCompletedByMMID(mmid)`

---

### **7. NEWS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/news` | `newsApi.getAll()` | ✅ Mapped |
| GET `/v1/news/{id}` | `newsApi.getById()` | ✅ Mapped |
| POST `/v1/news` | `newsApi.create()` | ✅ Mapped |
| PUT `/v1/news/{id}` | `newsApi.update()` | ✅ Mapped |
| DELETE `/v1/news/{id}` | `newsApi.delete()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **8. ANNOUNCEMENTS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/announcements` | `announcementsApi.getAll()` | ✅ Mapped |
| GET `/v1/announcements/{id}` | `announcementsApi.getById()` | ✅ Mapped |
| POST `/v1/announcements` | `announcementsApi.create()` | ✅ Mapped |
| PUT `/v1/announcements/{id}` | `announcementsApi.update()` | ✅ Mapped |
| DELETE `/v1/announcements/{id}` | `announcementsApi.delete()` | ✅ Mapped |
| PUT `/v1/announcements/{id}/toggle` | `announcementsApi.toggleActive()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **9. USERS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/users` | `usersApi.getAll()` | ✅ Mapped |
| GET `/v1/users/{id}` | `usersApi.getById()` | ✅ Mapped |
| PUT `/v1/users/{id}` | `usersApi.update()` | ✅ Mapped |
| DELETE `/v1/users/{id}` | `usersApi.delete()` | ✅ Mapped |
| GET `/v1/users/{id}/stats` | `enhancedUsersApi.getStats()` | ✅ Mapped |
| PUT `/v1/users/{id}/password` | `enhancedUsersApi.updatePassword()` | ✅ Mapped |
| PUT `/v1/users/{id}/toggle-status` | `enhancedUsersApi.toggleStatus()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **10. ORDERS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/orders` | `ordersApi.getAll()` | ✅ Mapped |
| GET `/v1/orders/my` | `ordersApi.getMy()` | ✅ Mapped |
| POST `/v1/orders` | `ordersApi.create()` | ✅ Mapped |
| GET `/v1/orders/{id}` | `ordersApi.getById()` | ✅ Mapped |
| PUT `/v1/orders/{id}/status` | `ordersApi.updateStatus()` | ✅ Mapped |
| PUT `/v1/orders/{id}/payment` | `ordersApi.updatePayment()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **11. MERCHANDISE** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/merchandise` | `merchandiseApi.getAll()` | ✅ Mapped |
| GET `/v1/merchandise/{id}` | `merchandiseApi.getById()` | ✅ Mapped |
| POST `/v1/merchandise` | `merchandiseApi.create()` | ✅ Mapped |
| PUT `/v1/merchandise/{id}` | `merchandiseApi.update()` | ✅ Mapped |
| DELETE `/v1/merchandise/{id}` | `merchandiseApi.delete()` | ✅ Mapped |
| PUT `/v1/merchandise/{id}/stock` | `merchandiseApi.updateStock()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **12. MEMBERS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/members` | `membersApi.getAll()` | ✅ Mapped |
| GET `/v1/members/mmid/{mmid}` | `membersApi.getByMMID()` | ✅ Mapped |
| POST `/v1/members/search` | `membersApi.search()` | ✅ Mapped |
| POST `/v1/members` | ❌ Missing | ⚠️ **UNMAPPED** |
| PUT `/v1/members/{id}` | ❌ Missing | ⚠️ **UNMAPPED** |
| GET `/v1/members/{id}/stats` | ❌ Missing | ⚠️ **UNMAPPED** |

**Missing**:
- `membersApi.create(data)`
- `membersApi.update(id, data)`
- `membersApi.getStats(id)`

---

### **13. REPORTS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/v1/reports/finance` | `reportsApi.getFinance()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **14. AIRTIME** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| POST `/v1/airtime/purchase` | `airtimeApi.purchase()` | ✅ Mapped |
| GET `/v1/airtime/balance` | `airtimeApi.getBalance()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **15. UPLOADS** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| POST `/v1/uploads` | `uploadsApi.uploadImage()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **16. M-PESA** ✅

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| POST `/v1/payments/mpesa` | `mpesaApi.initiateSTKPush()` | ✅ Mapped |
| GET `/v1/payments/mpesa/status/{checkoutRequestId}` | `mpesaApi.queryStatus()` | ✅ Mapped |
| POST `/mpesa/balance/query` | `mpesaBalanceApi.query()` | ✅ Mapped |

**Status**: ✅ All Mapped

---

### **17. WHATSAPP** ⚠️

| Backend Route | Frontend API | Status |
|--------------|--------------|--------|
| GET `/whatsapp/start` | ❌ Missing | ⚠️ **UNMAPPED** |
| GET `/whatsapp/qr` | ❌ Missing | ⚠️ **UNMAPPED** |
| POST `/whatsapp/webhook` | ❌ Missing | ⚠️ **UNMAPPED** |

**Missing**: Entire WhatsApp API module

---

## 📋 **SUMMARY OF UNMAPPED ENDPOINTS**

### **Critical Missing** (Should Add):

1. **Authentication**:
   - `GET /auth/mandatory-contribution` → Need `authApi.getMandatoryContribution()`

2. **Accounts**:
   - `GET /v1/accounts/{account}/transactions` → Need `accountsApi.getTransactions(accountId)`
   - `POST /v1/create-account` → Need `accountsApi.createAccount()`
   - `POST /v1/accounts/check` → Need `accountsApi.checkAccount()`

3. **Transactions**:
   - `GET /v1/transactions/{id}` → Need `transactionsApi.getById(id)`
   - `GET /v1/accounts/{reference}/transactions` → Need `transactionsApi.getByAccount(reference)`

4. **Tickets**:
   - `GET /tickets/{mmid}` → Need `ticketsApi.getByMMID(mmid)`
   - `POST /tickets/{mmid}/process` → Need `ticketsApi.processPurchase(mmid, data)`
   - `GET /tickets/check-payment-status/{ticketNumber}` → Need `ticketsApi.checkPaymentStatus(ticketNumber)`
   - `GET /tickets/completed/{mmid}` → Need `ticketsApi.getCompletedByMMID(mmid)`

5. **Members**:
   - `POST /v1/members` → Need `membersApi.create(data)`
   - `PUT /v1/members/{id}` → Need `membersApi.update(id, data)`
   - `GET /v1/members/{id}/stats` → Need `membersApi.getStats(id)`

6. **WhatsApp** (Optional):
   - `GET /whatsapp/start` → Need `whatsappApi.start()`
   - `GET /whatsapp/qr` → Need `whatsappApi.getQR()`

---

## 🎯 **MAPPING STATUS**

| Category | Total Routes | Mapped | Unmapped | % Complete |
|----------|-------------|--------|----------|------------|
| **Authentication** | 4 | 3 | 1 | 75% |
| **Projects** | 5 | 5 | 0 | 100% |
| **Accounts** | 13 | 10 | 3 | 77% |
| **Transactions** | 3 | 1 | 2 | 33% |
| **Withdrawals** | 4 | 4 | 0 | 100% |
| **Tickets** | 7 | 3 | 4 | 43% |
| **News** | 5 | 5 | 0 | 100% |
| **Announcements** | 6 | 6 | 0 | 100% |
| **Users** | 7 | 7 | 0 | 100% |
| **Orders** | 6 | 6 | 0 | 100% |
| **Merchandise** | 6 | 6 | 0 | 100% |
| **Members** | 6 | 3 | 3 | 50% |
| **Reports** | 1 | 1 | 0 | 100% |
| **Airtime** | 2 | 2 | 0 | 100% |
| **Uploads** | 1 | 1 | 0 | 100% |
| **M-Pesa** | 3 | 3 | 0 | 100% |
| **WhatsApp** | 3 | 0 | 3 | 0% |
| **TOTAL** | **82** | **66** | **16** | **80%** |

---

## ⚠️ **PRIORITY FIXES NEEDED**

### **HIGH PRIORITY** (Used in Components):
1. ✅ Members CRUD (create, update, getStats)
2. ✅ Transactions getById
3. ✅ Tickets purchase flow
4. ✅ Account transactions

### **MEDIUM PRIORITY** (Nice to Have):
5. ✅ Mandatory contribution check
6. ✅ Account check endpoint

### **LOW PRIORITY** (Admin/Internal):
7. ⚠️ WhatsApp integration (backend only)

---

## 📝 **RECOMMENDATION**

**Action Required**: Add 13 missing API methods to frontend

**Files to Update**:
- `services/api.ts` - Add missing methods

**Estimated Time**: 30 minutes

---

**Last Updated**: November 27, 2025, 12:41 PM  
**Status**: **80% Mapped** - 16 endpoints need frontend integration
