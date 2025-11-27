# 🔍 BACKEND ENDPOINT VERIFICATION

## ✅ **VERIFIED ENDPOINTS** (Exist in Backend)

### **Authentication** ✅
- ✅ POST `/api/auth/register` - User registration
- ✅ POST `/api/auth/login` - User login
- ✅ GET `/api/auth/me` - Get current user
- ✅ GET `/api/auth/mandatory-contribution` - Check mandatory status

### **Projects** ✅
- ✅ GET `/api/v1/projects` - Get all projects
- ✅ GET `/api/v1/projects/{id}` - Get single project
- ✅ POST `/api/v1/projects` - Create project (admin)
- ✅ PUT `/api/v1/projects/{id}` - Update project (admin)
- ✅ DELETE `/api/v1/projects/{id}` - Delete project (admin)

### **Accounts** ✅
- ✅ GET `/api/v1/accounts` - Get all accounts
- ✅ POST `/api/v1/accounts` - Create account
- ✅ GET `/api/v1/accounts/{id}` - Get single account
- ✅ PUT `/api/v1/accounts/{id}` - Update account
- ✅ DELETE `/api/v1/accounts/{id}` - Delete account
- ✅ POST `/api/v1/accounts/transfer` - Transfer funds
- ✅ POST `/api/v1/accounts/search` - Search accounts
- ✅ GET `/api/v1/account-types` - Get account types
- ✅ GET `/api/v1/account-subtypes` - Get account subtypes

### **Transactions** ✅
- ✅ GET `/api/v1/transactions` - Get all transactions
- ✅ GET `/api/v1/transactions/{id}` - Get single transaction
- ✅ GET `/api/v1/accounts/{reference}/transactions` - Get account transactions

### **Withdrawals** ✅
- ✅ POST `/api/v1/withdrawals/initiate` - Initiate withdrawal
- ✅ GET `/api/v1/withdrawals` - Get all withdrawals
- ✅ GET `/api/v1/withdrawals/{id}` - Get single withdrawal
- ✅ POST `/api/v1/withdrawals/send-otp` - Send OTP

### **Tickets** ✅
- ✅ GET `/api/tickets/{mmid}` - Get tickets for member
- ✅ POST `/api/tickets/{mmid}/process` - Purchase ticket
- ✅ GET `/api/tickets/completed/{mmid}` - Get completed tickets
- ✅ GET `/api/v1/tickets/completed/all` - Get all completed tickets
- ✅ POST `/api/winner-selection` - Select winner

### **Reports** ✅
- ✅ GET `/api/v1/reports/finance` - Get finance report

### **M-Pesa** ✅
- ✅ POST `/api/v1/payments/mpesa` - Initiate STK Push
- ✅ GET `/api/v1/payments/mpesa/status/{checkoutRequestId}` - Query status
- ✅ POST `/api/v1/payments/mpesa/callback` - M-Pesa callback
- ✅ POST `/api/v1/mpesa/b2c/result` - B2C result
- ✅ POST `/api/v1/mpesa/b2c/timeout` - B2C timeout

### **Airtime** ✅
- ✅ POST `/api/v1/airtime/purchase` - Purchase airtime
- ✅ GET `/api/v1/airtime/balance` - Get balance

### **M-Pesa Balance** ✅
- ✅ POST `/api/mpesa/balance/query` - Query M-Pesa balance
- ✅ POST `/api/mpesa/balance/result` - Balance result
- ✅ POST `/api/mpesa/balance/timeout` - Balance timeout

### **News** ✅
- ✅ GET `/api/v1/news` - Get all news
- ✅ GET `/api/v1/news/{id}` - Get single news

### **Uploads** ✅
- ✅ POST `/api/v1/uploads` - Upload file

---

## ❌ **MISSING ENDPOINTS** (Need to Add)

### **User Purchases/Orders** ❌
- ❌ GET `/api/v1/orders/my` - Get user's orders
- ❌ POST `/api/v1/orders` - Create order
- ❌ GET `/api/v1/orders/{id}` - Get single order
- ❌ PUT `/api/v1/orders/{id}/status` - Update order status

### **Merchandise/Catalog** ❌
- ❌ GET `/api/v1/merchandise` - Get all merchandise
- ❌ POST `/api/v1/merchandise` - Create merchandise (admin)
- ❌ PUT `/api/v1/merchandise/{id}` - Update merchandise (admin)
- ❌ DELETE `/api/v1/merchandise/{id}` - Delete merchandise (admin)

### **Delivery Management** ❌
- ❌ GET `/api/v1/deliveries` - Get all deliveries (admin)
- ❌ PUT `/api/v1/deliveries/{id}` - Update delivery status (admin)
- ❌ POST `/api/v1/deliveries/{id}/tracking` - Add tracking number

### **Members** ❌
- ❌ GET `/api/v1/members` - Get all members
- ❌ GET `/api/v1/members/{mmid}` - Get member by MMID
- ❌ POST `/api/v1/members/search` - Search members
- ❌ PUT `/api/v1/members/{id}` - Update member

### **User Dashboard Stats** ❌
- ❌ GET `/api/v1/users/stats` - Get user statistics
- ❌ GET `/api/v1/users/contributions` - Get user contributions
- ❌ GET `/api/v1/users/tickets` - Get user tickets

### **Announcements** ❌
- ❌ GET `/api/v1/announcements` - Get all announcements
- ❌ POST `/api/v1/announcements` - Create announcement (admin)
- ❌ PUT `/api/v1/announcements/{id}` - Update announcement (admin)
- ❌ DELETE `/api/v1/announcements/{id}` - Delete announcement (admin)

### **Project Assignment** ❌
- ❌ POST `/api/v1/projects/{id}/assign-account` - Assign account to project
- ❌ GET `/api/v1/projects/{id}/contributions` - Get project contributions
- ❌ GET `/api/v1/projects/{id}/progress` - Get project progress

---

## 🛠️ **ENDPOINTS TO CREATE**

### 1. **Orders Controller** (Priority: HIGH)
```php
// app/Http/Controllers/API/OrderController.php

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Get user's orders
        $userId = $request->user()->id;
        $orders = Order::where('user_id', $userId)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['success' => true, 'data' => $orders]);
    }
    
    public function store(Request $request)
    {
        // Create new order
        $validated = $request->validate([
            'items' => 'required|array',
            'delivery_address' => 'required|string',
            'phone_number' => 'required|string',
        ]);
        
        $order = Order::create([
            'user_id' => $request->user()->id,
            'order_number' => 'ORD-' . time(),
            'total_amount' => $this->calculateTotal($validated['items']),
            'status' => 'pending',
            'delivery_address' => $validated['delivery_address'],
        ]);
        
        // Create order items
        foreach ($validated['items'] as $item) {
            $order->items()->create($item);
        }
        
        return response()->json(['success' => true, 'data' => $order]);
    }
    
    public function updateStatus(Request $request, $id)
    {
        // Admin only - update order status
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);
        
        return response()->json(['success' => true, 'data' => $order]);
    }
}
```

### 2. **Merchandise Controller** (Priority: HIGH)
```php
// app/Http/Controllers/API/MerchandiseController.php

class MerchandiseController extends Controller
{
    public function index()
    {
        $merchandise = Merchandise::where('active', true)->get();
        return response()->json(['success' => true, 'data' => $merchandise]);
    }
    
    public function store(Request $request)
    {
        // Admin only
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'image_url' => 'nullable|string',
        ]);
        
        $merchandise = Merchandise::create($validated);
        return response()->json(['success' => true, 'data' => $merchandise]);
    }
}
```

### 3. **Member Controller** (Priority: MEDIUM)
```php
// app/Http/Controllers/API/MemberController.php

class MemberController extends Controller
{
    public function index()
    {
        $members = Member::with('wallet')->get();
        return response()->json(['success' => true, 'data' => $members]);
    }
    
    public function getByMMID($mmid)
    {
        $member = Member::where('mmid', $mmid)->first();
        return response()->json(['success' => true, 'data' => $member]);
    }
    
    public function search(Request $request)
    {
        $query = $request->input('query');
        $members = Member::where('name', 'like', "%{$query}%")
            ->orWhere('mmid', 'like', "%{$query}%")
            ->get();
        
        return response()->json(['success' => true, 'data' => $members]);
    }
}
```

### 4. **Announcement Controller** (Priority: MEDIUM)
```php
// app/Http/Controllers/API/AnnouncementController.php

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::where('active', true)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['success' => true, 'data' => $announcements]);
    }
    
    public function store(Request $request)
    {
        // Admin only
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);
        
        $announcement = Announcement::create($validated);
        return response()->json(['success' => true, 'data' => $announcement]);
    }
}
```

### 5. **User Stats Controller** (Priority: HIGH)
```php
// app/Http/Controllers/API/UserStatsController.php

class UserStatsController extends Controller
{
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;
        
        $stats = [
            'total_contributions' => Transaction::where('user_id', $userId)
                ->where('type', 'donation')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_purchases' => Order::where('user_id', $userId)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'total_tickets' => Ticket::where('buyer_phone', $request->user()->phone)
                ->count(),
            'projects_supported' => Transaction::where('user_id', $userId)
                ->where('type', 'donation')
                ->distinct('project_id')
                ->count(),
        ];
        
        return response()->json(['success' => true, 'data' => $stats]);
    }
    
    public function getContributions(Request $request)
    {
        $userId = $request->user()->id;
        
        $contributions = Transaction::where('user_id', $userId)
            ->where('type', 'donation')
            ->with('project')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['success' => true, 'data' => $contributions]);
    }
}
```

---

## 📝 **ROUTES TO ADD**

Add to `routes/api.php`:

```php
// User Orders
Route::middleware(ApiKeyMiddleware::class)->prefix('v1')->group(function () {
    Route::get('/orders/my', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    // Merchandise
    Route::get('/merchandise', [MerchandiseController::class, 'index']);
    Route::post('/merchandise', [MerchandiseController::class, 'store']);
    Route::put('/merchandise/{id}', [MerchandiseController::class, 'update']);
    Route::delete('/merchandise/{id}', [MerchandiseController::class, 'destroy']);
    
    // Members
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{mmid}', [MemberController::class, 'getByMMID']);
    Route::post('/members/search', [MemberController::class, 'search']);
    
    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    
    // User Stats
    Route::get('/users/stats', [UserStatsController::class, 'getStats']);
    Route::get('/users/contributions', [UserStatsController::class, 'getContributions']);
    Route::get('/users/tickets', [UserStatsController::class, 'getTickets']);
    
    // Project Management
    Route::post('/projects/{id}/assign-account', [ProjectController::class, 'assignAccount']);
    Route::get('/projects/{id}/contributions', [ProjectController::class, 'getContributions']);
    Route::get('/projects/{id}/progress', [ProjectController::class, 'getProgress']);
});
```

---

## ✅ **SUMMARY**

### **Existing Endpoints**: 50+
### **Missing Endpoints**: 20+
### **Priority**:
1. **HIGH**: Orders, Merchandise, User Stats
2. **MEDIUM**: Members, Announcements
3. **LOW**: Advanced project features

### **Next Steps**:
1. Create missing controllers
2. Add routes
3. Update frontend API service
4. Test all endpoints
5. Deploy

---

**Last Updated**: November 27, 2025, 12:01 PM
