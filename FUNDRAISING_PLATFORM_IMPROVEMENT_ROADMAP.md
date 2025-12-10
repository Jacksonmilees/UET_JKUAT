# UET JKUAT Fundraising Platform - Comprehensive Improvement & Implementation Roadmap

**Document Version**: 1.0
**Date**: December 10, 2025
**Status**: Implementation Planning Phase

---

## Executive Summary

This document outlines a comprehensive improvement and implementation roadmap for the UET JKUAT Ministry Funding Platform. The goal is to transform the current system into a **top-notch, transparent, and powerful fundraising tool** that rivals leading platforms like GoFundMe, while maintaining specific requirements for ministry and educational institution management.

### Key Improvement Areas

1. **Enhanced Shareable Fundraising Links** with tracking
2. **Ticket System Integration** with project-based campaigns
3. **Transparent Real-time Reporting** with PDF generation
4. **Advanced Role-Based Access Control** (Super Admin, Treasurer, Managers)
5. **Comprehensive Audit Logging** for all system activities
6. **M-Pesa Integration Improvements** (STK Push, registration fixes)
7. **Direct PayBill Withdrawals** with approval workflows
8. **Multi-level Reporting System** (per account, semester, month, project)
9. **Public-facing Transparency Dashboard**
10. **Enhanced Security & Compliance**

---

## Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Research Findings - Best Practices](#research-findings)
3. [Identified Issues & Gaps](#identified-issues--gaps)
4. [Proposed System Architecture](#proposed-system-architecture)
5. [Implementation Phases](#implementation-phases)
6. [Module-by-Module Improvements](#module-by-module-improvements)
7. [Screen-by-Screen Design](#screen-by-screen-design)
8. [Database Schema Changes](#database-schema-changes)
9. [API Endpoints](#api-endpoints)
10. [Frontend Components](#frontend-components)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)
13. [Security Considerations](#security-considerations)
14. [Success Metrics](#success-metrics)

---

## Current System Analysis

### Existing Features ✅

#### Backend (Laravel 11)
- ✅ User authentication (Laravel Sanctum)
- ✅ Account management with MMID system
- ✅ M-Pesa STK Push integration
- ✅ Basic project creation and management
- ✅ Transaction tracking
- ✅ Basic withdrawal system with OTP
- ✅ Notification system
- ✅ Basic reporting (financial, project reports)
- ✅ Admin dashboard with M-Pesa balance query
- ✅ Ticket sales system
- ✅ ShareableLink model (basic structure)

#### Frontend (React + TypeScript)
- ✅ User registration and login
- ✅ User dashboard
- ✅ Admin dashboard
- ✅ Project listing and management
- ✅ Transaction history
- ✅ Withdrawal requests
- ✅ Member directory
- ✅ Settings management
- ✅ Nuru AI chatbot integration

### Current Architecture Strengths 💪

1. **Service Layer Pattern**: Business logic properly separated into services
2. **Queue System**: Background job processing in place
3. **Type Safety**: TypeScript on frontend
4. **API Security**: API key middleware and rate limiting
5. **Modular Structure**: Well-organized codebase
6. **External Integrations**: M-Pesa, WhatsApp OTP, Gemini AI

---

## Research Findings

### Best Fundraising Platform Features (GoFundMe, Kickstarter)

Based on research from [GoFundMe](https://www.gofundme.com/c/blog/top-crowdfunding-sites), [Kickstarter](https://www.kickstarter.com/), and [Givebutter](https://givebutter.com/blog/gofundme-alternatives):

1. **Social Sharing**
   - Easy share buttons for social media
   - Shareable links with tracking
   - Embed widgets for external websites
   - Email campaign integration

2. **Transparency Features**
   - Real-time progress tracking
   - Public donation feed
   - Campaign updates feed
   - Automated thank you messages
   - Donor recognition options

3. **Flexible Funding Models**
   - Keep what you raise (flexible)
   - All-or-nothing campaigns
   - Recurring donations
   - Milestone-based releases

4. **Donor Experience**
   - Guest donations (no login required)
   - Multiple payment methods
   - Mobile-optimized checkout
   - Instant payment confirmation
   - Donation receipts

5. **Campaign Management**
   - Rich media support (images, videos)
   - Campaign story editor
   - Update posting
   - Comment sections
   - Team fundraising

### Church/Ministry Platform Features

Based on research from [DonorPerfect](https://www.donorperfect.com/nonprofits/religious-fundraising-software/), [Tithe.ly](https://theleadpastor.com/tools/best-church-giving-software/), and [Aplos](https://www.aplos.com/academy/church-accounting-best-practices-2025):

1. **Fund Accounting**
   - Separate tracking by purpose
   - Designated vs undesignated funds
   - Project/ministry allocation
   - Multi-account management

2. **Transparency & Reporting**
   - Quarterly financial reports
   - Annual giving statements
   - Project impact reports
   - Donor contribution history
   - Blockchain tracking (emerging trend)

3. **Role-Based Access**
   - Multi-level admin hierarchy
   - Treasurer-specific permissions
   - Committee oversight
   - Audit trail for all actions

4. **Compliance**
   - Tax receipt generation
   - Audit-ready reports
   - Regulatory compliance
   - Data export capabilities

### M-Pesa Best Practices

Based on research from [Zama M-Pesa Integration](https://zama.co.ke/blog/m-pesa-stk-push-integration/), [Burst Digital](https://burstdigital.co.ke/m-pesa-api-integration-how-to-integrate-mpesa-into-your-website-or-application-2025-new-guide/), and [DEV Community](https://dev.to/msnmongare/m-pesa-express-stk-push-api-guide-40a2):

1. **User Experience**
   - Prominent "Pay with M-Pesa" buttons
   - Minimal form fields
   - Loading indicators during processing
   - Clear error messages
   - Mobile-first design

2. **Technical Implementation**
   - Proper phone number validation/formatting
   - Callback signature verification
   - Sandbox testing before production
   - Retry & reconciliation engine
   - Transaction status polling

3. **Security**
   - Signature verification on callbacks
   - IP whitelisting (optional)
   - Secure password generation
   - Token caching and refresh
   - Comprehensive logging

---

## Identified Issues & Gaps

### Critical Issues 🔴

1. **Registration Issues**
   - Validation errors not clearly communicated
   - Phone number format inconsistencies
   - Duplicate email/phone handling

2. **M-Pesa STK Push Problems**
   - Callback URL configuration
   - Timeout handling
   - Error message clarity
   - Payment status polling
   - Transaction reconciliation

3. **Missing Core Features**
   - No shareable link tracking system
   - Limited ticket-to-project integration
   - No public donation pages
   - Missing audit logging
   - Incomplete role permissions

### High Priority Gaps 🟡

1. **Transparency Features**
   - No public transparency dashboard
   - Limited real-time updates
   - No automated donor notifications
   - Missing activity feeds

2. **Reporting System**
   - No PDF report generation with branding
   - Limited report customization
   - No semester-based reports
   - Missing scheduled reports

3. **Role Management**
   - Basic role system (admin/user only)
   - No treasurer role
   - No permission granularity
   - Missing role assignment UI

4. **Withdrawal System**
   - No approval workflow
   - Limited audit trail
   - No bulk withdrawals
   - Missing treasurer oversight

### Medium Priority Gaps 🟢

1. **User Experience**
   - No donation campaign pages
   - Limited social sharing
   - No embed widgets
   - Missing progress visualization

2. **Analytics**
   - No donor analytics
   - Limited campaign metrics
   - No conversion tracking
   - Missing dashboard insights

---

## Proposed System Architecture

### New System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  • Shareable Campaign Pages (No login required)             │
│  • Public Transparency Dashboard                            │
│  • Donation Widgets                                         │
│  • Project Showcase Pages                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  • Enhanced User Dashboard                                   │
│  • Campaign Creation & Management                           │
│  • Shareable Link Generator with Analytics                  │
│  • Personal Transaction History                             │
│  • Notification Center                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              MANAGER/TREASURER LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  • Account Management Dashboard                             │
│  • Withdrawal Approval System                               │
│  • Report Generation Tools                                  │
│  • Transaction Oversight                                    │
│  • Member Management                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                SUPER ADMIN LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  • Complete System Control                                   │
│  • Role & Permission Management                             │
│  • M-Pesa PayBill Management                                │
│  • System Configuration                                     │
│  • Comprehensive Audit Logs                                 │
│  • Advanced Analytics                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND SERVICES                            │
├─────────────────────────────────────────────────────────────┤
│  • Enhanced M-Pesa Service                                   │
│  • Campaign Management Service                              │
│  • Reporting Service (PDF Generation)                       │
│  • Audit Logging Service                                    │
│  • Notification Service (SMS, Email, WhatsApp)             │
│  • Analytics Service                                        │
│  • Withdrawal Approval Service                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL (Primary Database)                            │
│  • Redis (Caching & Queue)                                  │
│  • File Storage (S3/Local for PDFs, Images)                │
│  • Audit Log Storage                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation & Critical Fixes (Weeks 1-2)

**Priority**: 🔴 CRITICAL

#### 1.1 M-Pesa STK Push Improvements
- [ ] Fix callback URL registration
- [ ] Implement proper phone number validation
- [ ] Add retry mechanism for failed requests
- [ ] Improve error handling and user feedback
- [ ] Add transaction status polling
- [ ] Implement reconciliation service

**Files to Modify**:
- `app/Services/DarajaApiService.php`
- `app/Http/Controllers/API/MpesaCallbackController.php`
- `app/Http/Controllers/API/MpesaController.php`

#### 1.2 Registration System Fixes
- [ ] Improve validation error messages
- [ ] Add phone number formatting helper
- [ ] Implement duplicate checking with clear messages
- [ ] Add registration success confirmation
- [ ] Implement email verification (optional)

**Files to Modify**:
- `app/Http/Controllers/API/AuthController.php`
- `uetjkuat-funding-platform/pages/Register.tsx`

#### 1.3 Database Schema Updates
- [ ] Create `audit_logs` table
- [ ] Create `campaign_links` table (enhanced shareable links)
- [ ] Create `campaign_analytics` table
- [ ] Create `roles` and `permissions` tables
- [ ] Create `withdrawal_approvals` table
- [ ] Update `projects` table with campaign fields
- [ ] Update `users` table with enhanced roles

**Deliverables**:
- Working M-Pesa STK Push with proper error handling
- Improved registration flow
- New database migrations

---

### Phase 2: Shareable Link System & Campaigns (Weeks 3-4)

**Priority**: 🔴 HIGH

#### 2.1 Enhanced Shareable Link System

**Features**:
- Generate unique shareable links for projects
- Track all donations through each link
- Link creator can see detailed analytics
- Support for tickets tied to projects
- QR code generation for each link
- Custom campaign pages

**New Models**:

```php
// app/Models/Campaign.php
class Campaign extends Model
{
    protected $fillable = [
        'user_id',          // Link creator
        'project_id',       // Optional: link to project
        'unique_code',      // e.g., UET-FUND-ABC123
        'title',
        'description',
        'target_amount',
        'current_amount',
        'image_url',
        'slug',             // For friendly URLs
        'status',           // active, paused, completed
        'campaign_type',    // project, ticket, general
        'end_date',
        'settings',         // JSON: allow_anonymous, show_donors, etc.
        'analytics_data'    // JSON: views, shares, conversion_rate
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function donations() { return $this->hasMany(Donation::class); }
    public function analytics() { return $this->hasMany(CampaignAnalytic::class); }
}

// app/Models/CampaignAnalytic.php
class CampaignAnalytic extends Model
{
    protected $fillable = [
        'campaign_id',
        'event_type',       // view, share, donation, conversion
        'visitor_id',       // Anonymous tracking
        'ip_address',
        'user_agent',
        'referrer',
        'metadata'          // JSON: additional tracking data
    ];
}

// app/Models/CampaignDonation.php (extends Transaction)
class CampaignDonation extends Model
{
    protected $fillable = [
        'campaign_id',
        'transaction_id',
        'donor_name',
        'donor_email',
        'donor_phone',
        'amount',
        'is_anonymous',
        'message',
        'source'            // link, qr, direct
    ];
}
```

**New API Endpoints**:

```
POST   /api/v1/campaigns              - Create campaign
GET    /api/v1/campaigns              - List user's campaigns
GET    /api/v1/campaigns/{code}       - Get campaign details
PUT    /api/v1/campaigns/{code}       - Update campaign
DELETE /api/v1/campaigns/{code}       - Delete campaign
GET    /api/v1/campaigns/{code}/analytics - Get campaign analytics
POST   /api/v1/campaigns/{code}/share - Track share event

Public endpoints (no auth):
GET    /api/public/campaigns/{code}   - Public campaign page
POST   /api/public/campaigns/{code}/donate - Donate through campaign
GET    /api/public/campaigns/{code}/donations - Public donation feed
```

**Frontend Components**:

```typescript
// Campaign Creator
components/campaign/CampaignCreator.tsx
components/campaign/CampaignEditor.tsx
components/campaign/CampaignSettings.tsx

// Public Campaign Page
pages/campaign/[code].tsx
components/campaign/PublicCampaignPage.tsx
components/campaign/DonationForm.tsx
components/campaign/DonorWall.tsx
components/campaign/ShareButtons.tsx

// Campaign Dashboard
components/campaign/CampaignDashboard.tsx
components/campaign/CampaignAnalytics.tsx
components/campaign/DonationList.tsx
components/campaign/CampaignStats.tsx
```

#### 2.2 Ticket-Project Integration

**Features**:
- Create tickets tied to specific projects
- Ticket purchases contribute to project funding
- Track ticket sales through campaigns
- Generate tickets with QR codes
- Send ticket confirmations via WhatsApp/Email

**Implementation**:

```php
// Update Ticket model
class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'project_id',       // NEW: Link to project
        'campaign_id',      // NEW: Link to campaign
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'amount',
        'quantity',
        'qr_code',          // For validation
        'status',           // pending, paid, used, expired
        'metadata'
    ];

    public function project() { return $this->belongsTo(Project::class); }
    public function campaign() { return $this->belongsTo(Campaign::class); }
}
```

**Deliverables**:
- Complete shareable link system
- Campaign creation UI
- Public campaign pages
- Ticket-project integration
- Analytics dashboard

---

### Phase 3: Role-Based Access Control & Audit System (Weeks 5-6)

**Priority**: 🔴 HIGH

#### 3.1 Advanced RBAC System

**New Roles**:
1. **Super Admin** - Complete system control
2. **Treasurer** - Financial oversight, withdrawal approvals
3. **Project Manager** - Project and campaign management
4. **Account Manager** - Account operations
5. **Auditor** (Read-only) - View-only access to all records
6. **Member** - Basic user

**Permissions Matrix**:

```
Permission                    | Super | Treasurer | Manager | Auditor | Member
------------------------------|-------|-----------|---------|---------|-------
Create/Edit Users             |   ✓   |     ✗     |    ✗    |    ✗    |   ✗
Manage Roles                  |   ✓   |     ✗     |    ✗    |    ✗    |   ✗
Approve Withdrawals           |   ✓   |     ✓     |    ✗    |    ✗    |   ✗
View All Transactions         |   ✓   |     ✓     |    ✗    |    ✓    |   ✗
Generate Reports              |   ✓   |     ✓     |    ✓    |    ✓    |   ✗
Create Projects               |   ✓   |     ✗     |    ✓    |    ✗    |   ✓
Create Campaigns              |   ✓   |     ✗     |    ✓    |    ✗    |   ✓
Manage Own Campaigns          |   ✓   |     ✗     |    ✓    |    ✗    |   ✓
View Audit Logs               |   ✓   |     ✓     |    ✗    |    ✓    |   ✗
Configure M-Pesa              |   ✓   |     ✗     |    ✗    |    ✗    |   ✗
Export Data                   |   ✓   |     ✓     |    ✓    |    ✓    |   ✗
```

**Database Schema**:

```php
// Migration: create_roles_and_permissions_tables
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->json('permissions');  // Array of permission slugs
    $table->boolean('is_system')->default(false); // Cannot be deleted
    $table->timestamps();
});

Schema::create('role_user', function (Blueprint $table) {
    $table->id();
    $table->foreignId('role_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('assigned_by')->nullable()->constrained('users');
    $table->timestamp('assigned_at');
    $table->unique(['role_id', 'user_id']);
});
```

**Implementation**:

```php
// app/Models/Role.php
class Role extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'permissions', 'is_system'];
    protected $casts = ['permissions' => 'array', 'is_system' => 'boolean'];

    public function users() { return $this->belongsToMany(User::class)->withTimestamps(); }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }
}

// Update User model
public function roles()
{
    return $this->belongsToMany(Role::class)->withPivot('assigned_at', 'assigned_by');
}

public function hasRole($role)
{
    return $this->roles->contains('slug', $role);
}

public function hasPermission($permission)
{
    return $this->roles->contains(function ($role) use ($permission) {
        return $role->hasPermission($permission);
    });
}

public function isSuperAdmin()
{
    return $this->hasRole('super-admin') || $this->email === 'admin@uetjkuat.com';
}

public function isTreasurer()
{
    return $this->hasRole('treasurer') || $this->isSuperAdmin();
}
```

**Middleware**:

```php
// app/Http/Middleware/CheckPermission.php
class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        if (!$request->user()->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions'
            ], 403);
        }
        return $next($request);
    }
}

// Usage in routes:
Route::middleware(['auth:sanctum', 'permission:approve-withdrawals'])
    ->post('/withdrawals/{id}/approve', [WithdrawalController::class, 'approve']);
```

#### 3.2 Comprehensive Audit Logging

**Features**:
- Log all database changes
- Track user actions
- Record API requests
- Monitor system events
- Searchable audit trail
- Export capabilities

**Database Schema**:

```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('event');          // created, updated, deleted, accessed
    $table->string('auditable_type'); // Model class name
    $table->unsignedBigInteger('auditable_id')->nullable();
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->string('user_agent')->nullable();
    $table->string('url')->nullable();
    $table->json('metadata')->nullable();
    $table->timestamps();

    $table->index(['auditable_type', 'auditable_id']);
    $table->index('user_id');
    $table->index('event');
    $table->index('created_at');
});
```

**Implementation**:

```php
// app/Models/AuditLog.php
class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'event', 'auditable_type', 'auditable_id',
        'old_values', 'new_values', 'ip_address', 'user_agent',
        'url', 'metadata'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function auditable() { return $this->morphTo(); }
}

// app/Traits/Auditable.php
trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $model->logAudit('updated', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted', $model->getAttributes(), null);
        });
    }

    protected function logAudit($event, $old, $new)
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
        ]);
    }
}

// Add to models:
class Account extends Model
{
    use Auditable;
    // ...
}

class Transaction extends Model
{
    use Auditable;
    // ...
}
```

**Audit Log API**:

```php
// app/Http/Controllers/API/AuditLogController.php
class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('event')) {
            $query->where('event', $request->event);
        }
        if ($request->has('auditable_type')) {
            $query->where('auditable_type', $request->auditable_type);
        }
        if ($request->has('start_date')) {
            $query->where('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('created_at', '<=', $request->end_date);
        }

        return response()->json($query->paginate(50));
    }

    public function show($id)
    {
        $log = AuditLog::with('user', 'auditable')->findOrFail($id);
        return response()->json($log);
    }
}
```

**Deliverables**:
- Complete RBAC system
- Role management UI
- Permission middleware
- Comprehensive audit logging
- Audit log viewer

---

### Phase 4: Advanced Reporting System (Weeks 7-8)

**Priority**: 🟡 HIGH

#### 4.1 PDF Report Generation

**Features**:
- Generate branded PDF reports
- Multiple report types
- Customizable date ranges
- Automated scheduled reports
- Email delivery
- Report templates

**Report Types**:

1. **Account Statement Report**
   - All transactions for specific account
   - Balance summary
   - Date range filter
   - Export to PDF/Excel

2. **Project Report**
   - Project overview
   - All donations/contributions
   - Donor list
   - Progress charts
   - Expense breakdown

3. **Semester Report**
   - All activities in semester
   - Financial summary
   - Project breakdown
   - Member contributions

4. **Monthly Financial Report**
   - Income vs Expenses
   - Transaction summary
   - Top donors
   - Top projects
   - Balance changes

5. **Annual Report**
   - Year-end financial summary
   - Project achievements
   - Donor impact
   - Growth metrics

6. **Treasurer Report**
   - Complete financial overview
   - All accounts summary
   - Pending approvals
   - Withdrawal history
   - Compliance metrics

7. **Audit Report**
   - All system activities
   - User actions log
   - Security events
   - Data changes

**Implementation**:

```php
// app/Services/ReportGenerationService.php
class ReportGenerationService
{
    public function generateAccountStatement($accountId, $startDate, $endDate)
    {
        $account = Account::with(['transactions' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        }])->findOrFail($accountId);

        $pdf = PDF::loadView('reports.account-statement', [
            'account' => $account,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'transactions' => $account->transactions,
            'openingBalance' => $this->calculateOpeningBalance($accountId, $startDate),
            'closingBalance' => $account->balance
        ]);

        return $pdf->download("account-statement-{$account->reference}.pdf");
    }

    public function generateProjectReport($projectId)
    {
        $project = Project::with(['donations', 'account.transactions'])->findOrFail($projectId);

        $pdf = PDF::loadView('reports.project-report', [
            'project' => $project,
            'donations' => $project->donations,
            'totalRaised' => $project->current_amount,
            'donorCount' => $project->donations->count(),
            'averageDonation' => $project->donations->avg('amount'),
            'progressPercentage' => $project->progress_percentage
        ]);

        return $pdf->download("project-report-{$project->id}.pdf");
    }

    public function generateSemesterReport($semesterId)
    {
        $semester = Semester::with(['projects', 'transactions'])->findOrFail($semesterId);

        $data = [
            'semester' => $semester,
            'totalIncome' => Transaction::where('type', 'credit')
                ->whereBetween('created_at', [$semester->start_date, $semester->end_date])
                ->sum('amount'),
            'totalExpenses' => Transaction::where('type', 'debit')
                ->whereBetween('created_at', [$semester->start_date, $semester->end_date])
                ->sum('amount'),
            'projectCount' => $semester->projects->count(),
            'memberCount' => User::whereBetween('created_at', [$semester->start_date, $semester->end_date])->count()
        ];

        $pdf = PDF::loadView('reports.semester-report', $data);
        return $pdf->download("semester-report-{$semester->name}.pdf");
    }

    public function generateMonthlyReport($month, $year)
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $data = [
            'month' => $startDate->format('F Y'),
            'transactions' => Transaction::whereBetween('created_at', [$startDate, $endDate])->get(),
            'totalIncome' => Transaction::where('type', 'credit')
                ->whereBetween('created_at', [$startDate, $endDate])->sum('amount'),
            'totalExpenses' => Transaction::where('type', 'debit')
                ->whereBetween('created_at', [$startDate, $endDate])->sum('amount'),
            'topDonors' => $this->getTopDonors($startDate, $endDate),
            'topProjects' => $this->getTopProjects($startDate, $endDate)
        ];

        $pdf = PDF::loadView('reports.monthly-report', $data);
        return $pdf->download("monthly-report-{$month}-{$year}.pdf");
    }
}
```

**Blade Templates with UET Branding**:

```php
// resources/views/reports/account-statement.blade.php
<!DOCTYPE html>
<html>
<head>
    <title>Account Statement - {{ $account->reference }}</title>
    <style>
        @page { margin: 20mm; }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 10px;
        }
        .university-name {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
        }
        .ministry-name {
            font-size: 14pt;
            color: #333;
        }
        .report-title {
            font-size: 16pt;
            font-weight: bold;
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #1e40af;
            color: white;
            padding: 10px;
            text-align: left;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/uet-logo.png') }}" class="logo" alt="UET JKUAT Logo">
        <div class="university-name">JOMO KENYATTA UNIVERSITY OF AGRICULTURE AND TECHNOLOGY</div>
        <div class="ministry-name">United Evangelical Team Ministry</div>
        <div class="report-title">ACCOUNT STATEMENT</div>
    </div>

    <div class="account-details">
        <p><strong>Account Reference:</strong> {{ $account->reference }}</p>
        <p><strong>Account Name:</strong> {{ $account->name }}</p>
        <p><strong>Period:</strong> {{ $startDate }} to {{ $endDate }}</p>
        <p><strong>Opening Balance:</strong> KES {{ number_format($openingBalance, 2) }}</p>
        <p><strong>Closing Balance:</strong> KES {{ number_format($closingBalance, 2) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Reference</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            <tr>
                <td>{{ $transaction->created_at->format('Y-m-d') }}</td>
                <td>{{ $transaction->description ?? $transaction->type }}</td>
                <td>{{ $transaction->reference }}</td>
                <td>{{ $transaction->type === 'debit' ? number_format($transaction->amount, 2) : '-' }}</td>
                <td>{{ $transaction->type === 'credit' ? number_format($transaction->amount, 2) : '-' }}</td>
                <td>{{ number_format($transaction->running_balance, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Generated on {{ now()->format('F d, Y \a\t H:i') }} | UET JKUAT Ministry Funding Platform</p>
        <p>This is a system-generated document. For inquiries, contact: treasurer@uetjkuat.org</p>
    </div>
</body>
</html>
```

#### 4.2 Scheduled Reports

```php
// app/Console/Commands/GenerateScheduledReports.php
class GenerateScheduledReports extends Command
{
    protected $signature = 'reports:generate-scheduled';

    public function handle(ReportGenerationService $reportService)
    {
        // Monthly reports (1st of each month)
        if (now()->day === 1) {
            $lastMonth = now()->subMonth();
            $report = $reportService->generateMonthlyReport(
                $lastMonth->month,
                $lastMonth->year
            );

            // Email to treasurer
            Mail::to(config('app.treasurer_email'))
                ->send(new MonthlyReportMail($report));
        }

        // Semester reports (at semester end)
        $completedSemesters = Semester::where('end_date', '=', now()->toDateString())->get();
        foreach ($completedSemesters as $semester) {
            $report = $reportService->generateSemesterReport($semester->id);
            Mail::to(config('app.treasurer_email'))
                ->send(new SemesterReportMail($report));
        }
    }
}

// Schedule in Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('reports:generate-scheduled')->daily();
}
```

**Deliverables**:
- PDF report generation system
- Multiple report templates with branding
- Scheduled report generation
- Report API endpoints
- Report management UI

---

### Phase 5: Withdrawal Approval System (Weeks 9-10)

**Priority**: 🟡 MEDIUM

#### 5.1 Multi-Level Withdrawal Approval

**Features**:
- Treasurer approval required
- Configurable approval thresholds
- Approval workflow tracking
- Rejection with reasons
- OTP verification for approval
- Email/SMS notifications

**Database Schema**:

```php
Schema::create('withdrawal_approvals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('withdrawal_id')->constrained()->onDelete('cascade');
    $table->foreignId('approver_id')->nullable()->constrained('users');
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->text('notes')->nullable();
    $table->text('rejection_reason')->nullable();
    $table->string('otp_code')->nullable();
    $table->timestamp('otp_expires_at')->nullable();
    $table->timestamp('approved_at')->nullable();
    $table->timestamp('rejected_at')->nullable();
    $table->timestamps();
});

// Update withdrawals table
Schema::table('withdrawals', function (Blueprint $table) {
    $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->timestamp('approved_at')->nullable();
});
```

**Implementation**:

```php
// app/Services/WithdrawalApprovalService.php
class WithdrawalApprovalService
{
    public function requestApproval(Withdrawal $withdrawal)
    {
        // Create approval request
        $approval = WithdrawalApproval::create([
            'withdrawal_id' => $withdrawal->id,
            'status' => 'pending'
        ]);

        // Notify treasurers
        $treasurers = User::role('treasurer')->get();
        foreach ($treasurers as $treasurer) {
            $treasurer->notify(new WithdrawalApprovalRequest($withdrawal));
        }

        return $approval;
    }

    public function approve(Withdrawal $withdrawal, User $approver, string $otp, string $notes = null)
    {
        // Verify OTP
        if (!$this->verifyOTP($approver, $otp)) {
            throw new \Exception('Invalid OTP code');
        }

        DB::transaction(function () use ($withdrawal, $approver, $notes) {
            // Update withdrawal
            $withdrawal->update([
                'approval_status' => 'approved',
                'approved_by' => $approver->id,
                'approved_at' => now()
            ]);

            // Update approval record
            WithdrawalApproval::where('withdrawal_id', $withdrawal->id)
                ->update([
                    'approver_id' => $approver->id,
                    'status' => 'approved',
                    'notes' => $notes,
                    'approved_at' => now()
                ]);

            // Process the withdrawal (B2C transaction)
            $this->processWithdrawal($withdrawal);

            // Notify requester
            $withdrawal->user->notify(new WithdrawalApproved($withdrawal));
        });
    }

    public function reject(Withdrawal $withdrawal, User $approver, string $reason)
    {
        DB::transaction(function () use ($withdrawal, $approver, $reason) {
            $withdrawal->update([
                'approval_status' => 'rejected',
                'status' => 'rejected'
            ]);

            WithdrawalApproval::where('withdrawal_id', $withdrawal->id)
                ->update([
                    'approver_id' => $approver->id,
                    'status' => 'rejected',
                    'rejection_reason' => $reason,
                    'rejected_at' => now()
                ]);

            // Notify requester
            $withdrawal->user->notify(new WithdrawalRejected($withdrawal, $reason));
        });
    }
}
```

**API Endpoints**:

```php
// Treasurer endpoints
POST   /api/v1/withdrawals/{id}/approve    - Approve withdrawal (requires OTP)
POST   /api/v1/withdrawals/{id}/reject     - Reject withdrawal
GET    /api/v1/withdrawals/pending         - Get pending approvals
POST   /api/v1/withdrawals/{id}/request-otp - Request OTP for approval

// User endpoints
GET    /api/v1/withdrawals/my-requests     - My withdrawal requests
GET    /api/v1/withdrawals/{id}/status     - Check approval status
```

**Deliverables**:
- Withdrawal approval system
- Multi-level approval workflow
- OTP verification for approvals
- Approval management UI
- Notification system

---

### Phase 6: Public Transparency Dashboard (Weeks 11-12)

**Priority**: 🟢 MEDIUM

#### 6.1 Public-Facing Transparency Features

**Features**:
- Real-time donation feed
- Project progress tracking
- Financial transparency metrics
- Impact stories
- Donor recognition wall
- Live statistics

**Implementation**:

```php
// app/Http/Controllers/PublicTransparencyController.php
class PublicTransparencyController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_raised' => Transaction::where('type', 'credit')->sum('amount'),
            'total_projects' => Project::count(),
            'active_campaigns' => Campaign::where('status', 'active')->count(),
            'total_donors' => Transaction::distinct('payer_name')->count(),
            'recent_donations' => $this->getRecentDonations(),
            'top_projects' => $this->getTopProjects(),
            'monthly_growth' => $this->getMonthlyGrowth()
        ]);
    }

    protected function getRecentDonations()
    {
        return Transaction::where('type', 'credit')
            ->where('metadata->is_anonymous', '!=', true)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function($tx) {
                return [
                    'donor_name' => $tx->payer_name,
                    'amount' => $tx->amount,
                    'project' => $tx->metadata['project_name'] ?? 'General Fund',
                    'time' => $tx->created_at->diffForHumans()
                ];
            });
    }
}
```

**Frontend Component**:

```typescript
// components/public/TransparencyDashboard.tsx
export function TransparencyDashboard() {
  return (
    <div className="transparency-dashboard">
      <LiveStatistics />
      <RecentDonationsFeed />
      <ProjectProgressGrid />
      <ImpactMetrics />
      <DonorRecognitionWall />
      <MonthlyGrowthChart />
    </div>
  );
}
```

**Deliverables**:
- Public transparency dashboard
- Real-time donation feed
- Impact visualization
- Donor recognition system

---

## Database Schema Changes

### New Tables Summary

```sql
-- Campaigns System
CREATE TABLE campaigns (...)
CREATE TABLE campaign_analytics (...)
CREATE TABLE campaign_donations (...)

-- RBAC System
CREATE TABLE roles (...)
CREATE TABLE permissions (...)
CREATE TABLE role_user (...)

-- Audit System
CREATE TABLE audit_logs (...)

-- Withdrawal Approval
CREATE TABLE withdrawal_approvals (...)

-- Enhanced Projects
ALTER TABLE projects ADD COLUMN category_id ...
ALTER TABLE projects ADD COLUMN user_id ...
ALTER TABLE projects ADD COLUMN campaign_type ...

-- Enhanced Tickets
ALTER TABLE tickets ADD COLUMN project_id ...
ALTER TABLE tickets ADD COLUMN campaign_id ...
ALTER TABLE tickets ADD COLUMN qr_code ...

-- Report Storage
CREATE TABLE scheduled_reports (...)
```

---

## API Endpoints Summary

### New Public Endpoints

```
GET    /api/public/campaigns/{code}
POST   /api/public/campaigns/{code}/donate
GET    /api/public/campaigns/{code}/donations
GET    /api/public/transparency/dashboard
GET    /api/public/projects
GET    /api/public/projects/{id}
```

### New Protected Endpoints (Requires Auth)

```
# Campaigns
POST   /api/v1/campaigns
GET    /api/v1/campaigns
GET    /api/v1/campaigns/{code}
PUT    /api/v1/campaigns/{code}
DELETE /api/v1/campaigns/{code}
GET    /api/v1/campaigns/{code}/analytics

# Reports
GET    /api/v1/reports/account/{id}
GET    /api/v1/reports/project/{id}
GET    /api/v1/reports/semester/{id}
GET    /api/v1/reports/monthly/{year}/{month}
POST   /api/v1/reports/custom

# Roles & Permissions
GET    /api/v1/roles
POST   /api/v1/roles
PUT    /api/v1/roles/{id}
DELETE /api/v1/roles/{id}
POST   /api/v1/users/{id}/assign-role
POST   /api/v1/users/{id}/remove-role

# Audit Logs
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/{id}
GET    /api/v1/audit-logs/export

# Withdrawal Approvals
GET    /api/v1/withdrawals/pending
POST   /api/v1/withdrawals/{id}/approve
POST   /api/v1/withdrawals/{id}/reject
POST   /api/v1/withdrawals/{id}/request-otp
```

---

## Testing Strategy

### Unit Tests
- [ ] Model tests (relationships, scopes, methods)
- [ ] Service tests (business logic)
- [ ] Helper function tests

### Integration Tests
- [ ] API endpoint tests
- [ ] M-Pesa callback tests
- [ ] Campaign flow tests
- [ ] Withdrawal approval flow tests

### E2E Tests
- [ ] Complete donation flow
- [ ] Campaign creation and sharing
- [ ] Admin approval workflows
- [ ] Report generation

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] All migrations tested
- [ ] Seed data prepared
- [ ] Environment variables documented
- [ ] API documentation updated
- [ ] User documentation created
- [ ] Training materials prepared

### Deployment Steps

1. **Database Migration**
   ```bash
   php artisan migrate
   php artisan db:seed --class=RolesAndPermissionsSeeder
   ```

2. **Cache Configuration**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Queue Workers**
   ```bash
   php artisan queue:restart
   ```

4. **Frontend Build**
   ```bash
   cd uetjkuat-funding-platform
   npm run build
   ```

---

## Security Considerations

### Critical Security Updates

1. **API Security**
   - [ ] Rate limiting on all public endpoints
   - [ ] CSRF protection
   - [ ] XSS prevention
   - [ ] SQL injection protection (use Eloquent)

2. **Data Protection**
   - [ ] Encrypt sensitive data
   - [ ] GDPR compliance
   - [ ] Data retention policies
   - [ ] Secure file uploads

3. **Access Control**
   - [ ] Role-based permissions enforced
   - [ ] API key rotation
   - [ ] Session management
   - [ ] Two-factor authentication (optional)

4. **M-Pesa Security**
   - [ ] Callback signature verification
   - [ ] IP whitelisting
   - [ ] Secure credential storage
   - [ ] Transaction reconciliation

---

## Success Metrics

### Key Performance Indicators

1. **User Adoption**
   - [ ] Number of campaigns created
   - [ ] Donation conversion rate
   - [ ] User retention rate

2. **Financial Metrics**
   - [ ] Total funds raised
   - [ ] Average donation amount
   - [ ] Payment success rate

3. **System Performance**
   - [ ] API response times < 200ms
   - [ ] M-Pesa success rate > 95%
   - [ ] Report generation < 5 seconds
   - [ ] System uptime > 99.5%

4. **Transparency Metrics**
   - [ ] Audit log completeness
   - [ ] Report generation frequency
   - [ ] Public dashboard engagement

---

## Next Steps

### Immediate Actions (Week 1)

1. **Review and Approve Roadmap**
   - Team review meeting
   - Stakeholder approval
   - Budget allocation

2. **Setup Development Environment**
   - Create feature branches
   - Setup testing environment
   - Configure CI/CD pipeline

3. **Start Phase 1 Implementation**
   - Fix M-Pesa STK Push issues
   - Improve registration flow
   - Create database migrations

### Weekly Milestones

- **Week 1**: Phase 1 complete, M-Pesa working
- **Week 2**: Registration fixed, database updated
- **Week 4**: Campaigns system live
- **Week 6**: RBAC and audit logging complete
- **Week 8**: Reporting system operational
- **Week 10**: Withdrawal approval system live
- **Week 12**: Public transparency dashboard launched

---

## Resources & References

### Research Sources

- [GoFundMe Top Crowdfunding Sites](https://www.gofundme.com/c/blog/top-crowdfunding-sites)
- [Kickstarter vs GoFundMe](https://www.doublejump.media/kickstarter-vs-gofundme-which-platform-is-best-for-you/)
- [Givebutter GoFundMe Alternatives](https://givebutter.com/blog/gofundme-alternatives)
- [Church Giving Software 2025](https://theleadpastor.com/tools/best-church-giving-software/)
- [Church Accounting Best Practices](https://www.aplos.com/academy/church-accounting-best-practices-2025)
- [M-Pesa STK Push Integration](https://zama.co.ke/blog/m-pesa-stk-push-integration/)
- [M-Pesa API Integration Guide](https://burstdigital.co.ke/m-pesa-api-integration-how-to-integrate-mpesa-into-your-website-or-application-2025-new-guide/)

---

## Conclusion

This roadmap provides a comprehensive, phased approach to transforming the UET JKUAT Funding Platform into a powerful, transparent, and user-friendly fundraising tool. Each phase builds upon the previous one, ensuring stability while adding new features.

The implementation focuses on:
- ✅ Solving critical issues first (M-Pesa, registration)
- ✅ Building core features (campaigns, RBAC, audit logging)
- ✅ Enhancing transparency (reporting, public dashboard)
- ✅ Ensuring security and compliance throughout

By following this roadmap, the platform will become a best-in-class fundraising solution tailored specifically for ministry and educational institution needs.

---

**Document Maintained By**: UET JKUAT Development Team
**Last Updated**: December 10, 2025
**Next Review**: Weekly during implementation

