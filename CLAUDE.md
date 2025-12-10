# CLAUDE.md - AI Assistant Guide for UET JKUAT Repository

## Repository Overview

This is a **monorepo** containing the UET JKUAT Ministry Funding Platform - a comprehensive system for managing ministry finances, M-Pesa payments, ticketing, and member accounts.

### Quick Stats
- **Primary Language**: PHP (Laravel 11) + TypeScript (React)
- **Database**: PostgreSQL (production via Neon), SQLite (local dev)
- **Main Framework**: Laravel 11.31+ with React 19+
- **Deployment**: Render (backend), Vercel-compatible (frontends)
- **Queue System**: Database-backed queue with scheduled jobs
- **Payment Integration**: M-Pesa Daraja API (STK Push, B2C withdrawals)

---

## Repository Structure

```
UET_JKUAT/
├── app/                          # Laravel application core
│   ├── Console/Commands/         # Artisan commands (M-Pesa, statements)
│   ├── Http/
│   │   ├── Controllers/          # Web controllers
│   │   │   └── API/              # REST API controllers (30+ endpoints)
│   │   └── Middleware/           # API key, security, rate limiting
│   ├── Jobs/                     # Queue jobs (M-Pesa processing, notifications)
│   ├── Models/                   # Eloquent models (23 models)
│   ├── Services/                 # Business logic layer (16+ services)
│   │   ├── AccountService.php
│   │   ├── DarajaApiService.php
│   │   ├── MpesaBalanceService.php
│   │   ├── PaymentNotificationService.php
│   │   ├── WhatsappWebService.php
│   │   └── GeminiAIService.php
│   └── Traits/                   # Reusable trait classes
│
├── database/
│   ├── migrations/               # Database schema migrations
│   ├── seeders/                  # Database seeders
│   └── factories/                # Model factories for testing
│
├── routes/
│   ├── api.php                   # API routes (~700 lines)
│   ├── web.php                   # Web routes
│   └── console.php               # Console routes
│
├── config/                       # Laravel configuration files
├── resources/
│   └── views/                    # Blade templates (emails, PDFs, tickets)
│
├── nuru-campus-companion/        # React AI chatbot (Gemini-powered)
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── App.tsx                   # Main app (~600 lines)
│
├── uetjkuat-funding-platform/    # Main React frontend
│   ├── components/               # UI components (forms, dashboards, etc.)
│   ├── contexts/                 # React contexts
│   ├── pages/                    # Page components
│   ├── services/                 # API service layer
│   ├── styles/                   # CSS/Tailwind styles
│   └── App.tsx                   # Main app router
│
├── whatsapp-otp-service/         # WhatsApp OTP Node.js service
│   ├── uet-jkuat-otp.js         # Main service file
│   └── package.json
│
├── docs/                         # Developer documentation
│   ├── architecture.md
│   ├── api.md
│   ├── quickstart.md
│   ├── development.md
│   └── [8 more docs]
│
└── [100+ markdown docs]          # Extensive project documentation
```

---

## Technology Stack

### Backend (Laravel)
- **Framework**: Laravel 11.31+
- **PHP Version**: 8.2+
- **Authentication**: Laravel Sanctum (token-based API auth)
- **Key Packages**:
  - `laravel/sanctum` - API authentication
  - `barryvdh/laravel-dompdf` - PDF generation
  - `intervention/image` - Image processing
  - `laravel/pint` - Code formatting
  - `phpunit/phpunit` - Testing

### Frontend Projects

#### 1. uetjkuat-funding-platform (Main App)
- **Framework**: React 19.1 + TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS 3.4
- **Icons**: lucide-react 0.555
- **AI**: Google Gemini (@google/genai)
- **Features**: User dashboard, admin panel, payments, projects, member management

#### 2. nuru-campus-companion (AI Chatbot)
- **Framework**: React 19.2 + TypeScript 5.8
- **AI**: Google Gemini (@google/genai)
- **Features**: AI-powered campus assistant, conversational interface

#### 3. whatsapp-otp-service (OTP Service)
- **Runtime**: Node.js
- **Framework**: Express 4.18
- **Automation**: Puppeteer 24.11 (WhatsApp Web automation)
- **Purpose**: WhatsApp-based OTP authentication

### Database & Infrastructure
- **Production DB**: PostgreSQL (Neon serverless)
- **Local DB**: SQLite (default)
- **Cache**: File-based (configurable to Redis)
- **Queue**: Database-backed
- **Session**: Database-backed
- **File Storage**: Local + base64 (for images)

### External Services
- **M-Pesa Daraja API**: Payment processing (STK Push, B2C)
- **WhatsApp Web**: OTP delivery
- **Google Gemini AI**: Chatbot and AI features
- **SMS Provider**: Configurable SMS gateway
- **Email**: SMTP (Mailtrap/Postmark/SES)

---

## Key Models & Database Schema

### Core Models (app/Models/)
1. **User** - System users (admin, members)
2. **Account** - Financial accounts (MMID-based)
3. **Transaction** - Financial transactions
4. **Project** - Ministry projects
5. **Ticket** - Event tickets
6. **Member** - Ministry members
7. **Withdrawal** - Withdrawal requests
8. **MpesaTransactionLog** - M-Pesa transaction logs
9. **Notification** - User notifications
10. **Announcement** - System announcements
11. **News** - News articles
12. **Merchandise** - Merchandise items
13. **Category** - Project categories
14. **Semester** - Academic semesters
15. **RechargeContribution** - Account recharge tracking
16. **AccountRechargeToken** - Recharge tokens
17. **Setting** - System settings
18. **FraudAlert** - Fraud detection alerts

### Key Relationships
- User → hasMany → Accounts, Transactions, Projects
- Account → hasMany → Transactions, Withdrawals
- Project → belongsTo → Category, User
- Transaction → belongsTo → Account

---

## API Architecture

### Base Paths
- **Public**: `/api/*` - No authentication
- **Protected**: `/api/v1/*` - Requires `X-API-Key` header

### Authentication Middleware
1. **api.key** - Validates `X-API-Key` against `config('services.api.key')`
2. **sanctum** - Token-based authentication for users
3. **withdrawal_api** - Withdrawal-specific authentication

### Security Middleware
1. **SecurityHeaders** - Sets browser security headers
2. **TransactionRateLimit** - IP-based rate limiting
3. **ValidateTransactionRequest** - Webhook signature validation

### Major API Endpoints

#### Payments & M-Pesa
- `POST /api/v1/payments/mpesa` - Initiate STK Push
- `POST /api/v1/payments/mpesa/callback` - M-Pesa callback handler
- `POST /api/v1/mpesa/b2c/result` - B2C result callback
- `POST /api/mpesa/balance/query` - Query M-Pesa balance

#### Accounts (Protected)
- `GET|POST /api/v1/accounts` - CRUD operations
- `POST /api/v1/accounts/transfer` - Account transfers
- `POST /api/v1/accounts/validate-transfer` - Validate transfer
- `GET|POST /api/v1/accounts/search` - Search accounts
- `GET /api/v1/accounts/{account}/transactions` - Account history

#### Projects (Protected)
- `GET|POST /api/v1/projects` - CRUD operations
- `GET|PUT|DELETE /api/v1/projects/{id}` - Manage projects

#### Tickets (Public)
- `GET /api/tickets/{mmid}` - Purchase page
- `POST /api/tickets/{mmid}/process` - Process purchase
- `GET /api/tickets/check-payment-status/{ticketNumber}` - Check status

#### Withdrawals (Protected)
- `POST /api/v1/withdrawals/initiate` - Initiate withdrawal
- `POST /api/v1/withdrawals/send-otp` - Send OTP
- `GET /api/v1/withdrawals` - List withdrawals

#### Auth & Users
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/user` - Get authenticated user

#### WhatsApp OTP
- `GET /api/whatsapp/start` - Start WhatsApp session
- `GET /api/whatsapp/qr` - Get QR code
- `POST /api/whatsapp/webhook` - WhatsApp webhook

---

## Development Workflows

### Local Development Setup

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment setup
cp .env.example .env
php artisan key:generate

# 3. Database setup
touch database/database.sqlite  # For SQLite
php artisan migrate --seed

# 4. Run development server
composer run dev  # Runs: server + queue + logs + vite

# OR run individually:
php artisan serve              # Backend only
php artisan queue:work         # Queue worker
npm run dev                    # Frontend only
```

### Frontend Projects Setup

```bash
# Main funding platform
cd uetjkuat-funding-platform
npm install
npm run dev

# Nuru AI companion
cd nuru-campus-companion
npm install
npm run dev

# WhatsApp OTP service
cd whatsapp-otp-service
npm install
npm start
```

### Running Queue & Scheduler

```bash
# Queue worker (for background jobs)
php artisan queue:work

# Queue listener (with auto-reload)
php artisan queue:listen --tries=1

# Scheduler (for cron jobs)
php artisan schedule:work
```

### Scheduled Jobs (app/Console/Kernel.php)
- **M-Pesa Processing**: Every 5 minutes (`mpesa:process-transactions`)
- **Daily Statements**: Daily at 18:21 (`statements:daily`)

---

## Key Artisan Commands

### M-Pesa Operations
```bash
php artisan mpesa:register-urls           # Register M-Pesa callback URLs
php artisan mpesa:process-transactions -v # Process pending transactions
php artisan mpesa:balance                 # Query M-Pesa balance
```

### Account Management
```bash
php artisan accounts:create-system        # Create system accounts
```

### Statement Generation
```bash
php artisan statements:daily              # Generate daily statements
php artisan statements:send --start=2025-01-01 --end=2025-01-31
```

### Maintenance
```bash
php artisan migrate:fresh --seed          # Reset database
php artisan queue:restart                 # Restart queue workers
php artisan cache:clear                   # Clear cache
php artisan config:clear                  # Clear config cache
```

---

## Important Configuration Files

### Environment Variables (.env)

#### Core Settings
```env
APP_NAME="UET JKUAT Funding"
APP_ENV=production
APP_KEY=base64:...                        # Generate with php artisan key:generate
APP_DEBUG=false
APP_URL=https://uet-jkuat.onrender.com/api
```

#### Database
```env
DB_CONNECTION=pgsql                       # Use 'sqlite' for local
DB_HOST=ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_0eOnTvcjFJV3
DB_SSLMODE=require
```

#### M-Pesa Configuration
```env
MPESA_ENV=sandbox                         # or 'production'
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=4187577
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://api.uetjkuat.org/api/v1/payments/mpesa/callback
MPESA_TREASURER_NUMBERS=254700088271
```

#### WhatsApp & OTP
```env
WHATSAPP_WEB_API_URL=https://whatsapp.uetjkuat.org
OTP_SERVICE_URL=http://localhost:5001
```

#### AI Features
```env
GEMINI_ENABLED=false                      # Set to 'true' to enable AI features
GEMINI_API_KEY=...                        # Google Gemini API key
```

---

## Code Conventions & Best Practices

### Laravel Backend

#### 1. Controller Organization
- **Web Controllers**: `/app/Http/Controllers/`
- **API Controllers**: `/app/Http/Controllers/API/`
- **Naming**: `{Resource}Controller.php` (e.g., `AccountController.php`)
- **Methods**: Follow RESTful conventions (index, show, store, update, destroy)

#### 2. Service Layer Pattern
**All business logic belongs in Services, NOT Controllers**

```php
// ✅ GOOD - Controller delegates to service
class AccountController extends Controller
{
    protected AccountService $accountService;

    public function transfer(Request $request)
    {
        return $this->accountService->processTransfer($request->validated());
    }
}

// ❌ BAD - Business logic in controller
class AccountController extends Controller
{
    public function transfer(Request $request)
    {
        // 50 lines of business logic...
    }
}
```

**Key Services:**
- `AccountService` - Account operations (68KB, largest service)
- `DarajaApiService` - M-Pesa API integration
- `PaymentNotificationService` - Payment notifications (42KB)
- `WhatsappWebService` - WhatsApp integration
- `GeminiAIService` - AI features

#### 3. Model Conventions
- Use Eloquent relationships extensively
- Define fillable/guarded properties
- Use accessors/mutators for data formatting
- Add model events when needed (e.g., `creating`, `updated`)

#### 4. Validation
- Use Form Requests for complex validation
- Validate in controllers for simple cases
- Always validate external inputs (M-Pesa callbacks, webhooks)

#### 5. Queue Jobs
- Long-running tasks MUST use queue jobs
- Example: `ProcessMpesaTransaction`, `ProcessWalletNotification`
- Use `dispatch()` helper for job dispatching

#### 6. Error Handling
```php
// Always return JSON responses for API endpoints
return response()->json([
    'success' => false,
    'message' => 'Error message',
    'errors' => $errors  // Optional validation errors
], 400);
```

#### 7. Code Style
- Run Laravel Pint before committing: `vendor/bin/pint`
- Follow PSR-12 coding standards
- Use meaningful variable names
- Comment complex business logic

### Frontend (React + TypeScript)

#### 1. Component Organization
```
components/
├── ui/              # Reusable UI components (buttons, inputs, cards)
├── forms/           # Form components
├── layout/          # Layout components (header, footer, sidebar)
└── features/        # Feature-specific components
```

#### 2. TypeScript Conventions
- Define interfaces for all props
- Use type safety for API responses
- Avoid `any` type - use `unknown` if needed
- Export types from a central `types.ts` file

#### 3. State Management
- Use React Context for global state
- Local state with `useState` for component state
- Custom hooks for reusable logic (see `/hooks` directory)

#### 4. API Integration
- Centralize API calls in `/services` directory
- Use consistent error handling
- Always handle loading and error states

```typescript
// Example service pattern
export const accountService = {
  async getAccount(id: string) {
    const response = await fetch(`${API_URL}/api/v1/accounts/${id}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch account');
    return response.json();
  }
};
```

#### 5. Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Keep custom CSS in `/styles` directory
- Use lucide-react for icons

#### 6. Build & Deployment
```bash
npm run build                  # Production build
npm run preview                # Preview production build
node server.js                 # Serve production build
```

---

## Security Considerations

### 1. API Security
- **API Key Protection**: Never commit `.env` files
- **Rate Limiting**: TransactionRateLimit middleware on sensitive endpoints
- **CORS**: Configured in `config/cors.php`
- **Input Validation**: Always validate and sanitize inputs
- **SQL Injection**: Use Eloquent ORM (parameterized queries)

### 2. M-Pesa Security
- **Callback Validation**: ValidateTransactionRequest middleware
- **Webhook Signatures**: Verify signatures on all webhooks
- **Secret Keys**: Store in environment variables only
- **IP Whitelisting**: Consider adding M-Pesa IP whitelist

### 3. Authentication
- **Sanctum Tokens**: Token-based API authentication
- **Password Hashing**: Laravel's bcrypt by default
- **OTP Verification**: WhatsApp-based OTP for withdrawals
- **Session Security**: Database-backed sessions

### 4. File Uploads
- **Image Validation**: Validate file types and sizes
- **Base64 Storage**: Used for profile images
- **Path Traversal**: Never trust user-provided paths

### 5. XSS & CSRF
- **Blade Escaping**: Use `{{ $var }}` (auto-escaped)
- **CSRF Tokens**: Enabled for web routes
- **Content Security Policy**: Set via SecurityHeaders middleware

---

## Testing

### Backend Testing
```bash
php artisan test                          # Run PHPUnit tests
php artisan test --filter AccountTest     # Run specific test
vendor/bin/phpunit                        # Direct PHPUnit
```

### Frontend Testing
```bash
cd uetjkuat-funding-platform
npm run test                              # If configured
```

### Manual API Testing
See `docs/api.md` for endpoint documentation.

**Test Scripts Available:**
- `test-endpoints.ps1` - PowerShell script to test endpoints
- `test-heroku-api.ps1` - Test Heroku deployment
- `test-registration.ps1` - Test registration flow

---

## Deployment

### Backend (Render/Heroku)

#### Files
- `Procfile` - Process configuration
- `render.yaml` - Render deployment config
- `.render-build.sh` - Build script

#### Deployment Steps
```bash
# Set environment variables (see .env.example)
# Push to git repository
git push origin main

# Render auto-deploys on push to main
# Manual commands if needed:
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend (Vercel/Render)

#### uetjkuat-funding-platform
```bash
cd uetjkuat-funding-platform
npm run build
# Deploy dist/ folder to hosting
```

#### nuru-campus-companion
```bash
cd nuru-campus-companion
npm run build
# Deploy dist/ folder to hosting
```

### WhatsApp OTP Service
```bash
cd whatsapp-otp-service
# Deploy to Heroku or similar Node.js host
# Ensure PORT environment variable is set
```

---

## Common Workflows for AI Assistants

### 1. Adding a New API Endpoint

```bash
# Step 1: Create controller method
app/Http/Controllers/API/{Resource}Controller.php

# Step 2: Add route
routes/api.php

# Step 3: Add business logic to service
app/Services/{Resource}Service.php

# Step 4: Test the endpoint
curl -X POST https://api.uetjkuat.org/api/v1/{endpoint} \
  -H "X-API-Key: {key}" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Step 5: Update documentation
docs/api.md
```

### 2. Creating a Database Migration

```bash
# Create migration
php artisan make:migration create_table_name_table

# Edit migration file
database/migrations/{timestamp}_create_table_name_table.php

# Run migration
php artisan migrate

# Rollback if needed
php artisan migrate:rollback
```

### 3. Adding a Queue Job

```bash
# Create job
php artisan make:job ProcessSomething

# Implement handle() method
app/Jobs/ProcessSomething.php

# Dispatch job
ProcessSomething::dispatch($data);

# Process jobs
php artisan queue:work
```

### 4. Adding a Scheduled Task

```php
// Edit app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('your:command')
             ->everyFiveMinutes();
}
```

### 5. Creating a New Model

```bash
# Create model with migration
php artisan make:model ModelName -m

# Or with factory and seeder
php artisan make:model ModelName -mfs
```

### 6. Adding Frontend Component

```typescript
// Create component file
uetjkuat-funding-platform/components/{FeatureName}.tsx

// Define props interface
interface FeatureNameProps {
  // props
}

// Implement component
export function FeatureName({ props }: FeatureNameProps) {
  // component logic
}

// Import in parent component
import { FeatureName } from './components/FeatureName';
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database credentials in .env
# For SQLite, ensure file exists:
touch database/database.sqlite
php artisan migrate
```

#### 2. Queue Jobs Not Processing
```bash
# Restart queue worker
php artisan queue:restart
php artisan queue:work
```

#### 3. M-Pesa Callback Failures
```bash
# Check callback URL registration
php artisan mpesa:register-urls

# Verify webhook signature validation
# Check logs: storage/logs/laravel.log
```

#### 4. Frontend Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Increase Node memory for large builds
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build
```

#### 5. CORS Issues
```bash
# Check config/cors.php
# Ensure frontend URL is in allowed_origins
# Clear config cache: php artisan config:clear
```

### Logs Location
- **Laravel**: `storage/logs/laravel.log`
- **Statements**: `storage/logs/statements.log`
- **Queue**: Stdout when running `queue:work`

### Debug Mode
```env
# Enable in .env (NEVER in production)
APP_DEBUG=true
LOG_LEVEL=debug
```

---

## Git Workflow

### Branch Strategy
- **Main Branch**: `main` (production)
- **Feature Branches**: `feature/feature-name`
- **Bug Fixes**: `fix/bug-description`
- **Claude Branches**: `claude/claude-md-*` (auto-generated)

### Commit Guidelines
```bash
# Good commit messages
git commit -m "Add M-Pesa B2C withdrawal endpoint"
git commit -m "Fix account transfer validation logic"
git commit -m "Update admin dashboard with new metrics"

# Bad commit messages (avoid)
git commit -m "fixes"
git commit -m "wip"
git commit -m "asdf"
```

### Before Committing
```bash
# Run code formatting
vendor/bin/pint

# Run tests
php artisan test

# Check for debug statements
grep -r "dd(" app/
grep -r "dump(" app/
```

---

## Documentation Files Reference

### Critical Documentation
1. **docs/quickstart.md** - Getting started guide
2. **docs/architecture.md** - System architecture
3. **docs/api.md** - API reference
4. **docs/development.md** - Development workflow
5. **docs/deployment.md** - Deployment guide
6. **docs/security.md** - Security considerations

### Project-Specific Docs
- **ALL_FEATURES_IMPLEMENTED.md** - Feature completion status
- **COMPLETE_SYSTEM_FLOW.md** - System flow documentation
- **API_INTEGRATION.md** - API integration guide
- **MPESA_PRODUCTION_SETUP.md** - M-Pesa production setup
- **OTP_INTEGRATION_COMPLETE.md** - OTP integration docs

### Deployment Docs
- **RENDER_DEPLOYMENT.md** - Render deployment guide
- **HEROKU_DEPLOYMENT_ARCHITECTURE.md** - Heroku setup
- **DEPLOYMENT_READY_CHECKLIST.md** - Pre-deployment checklist

---

## Important Notes for AI Assistants

### Do's ✅
1. **Read existing code** before making changes
2. **Follow service layer pattern** - business logic in services
3. **Use type hints** in PHP and TypeScript
4. **Validate all inputs** especially from external sources
5. **Test API endpoints** after creating them
6. **Update documentation** when adding features
7. **Use existing patterns** - don't reinvent the wheel
8. **Check logs** when debugging issues
9. **Use queue jobs** for long-running tasks
10. **Follow Laravel conventions** (naming, structure)

### Don'ts ❌
1. **Never commit `.env` files** or secrets
2. **Don't put business logic in controllers** - use services
3. **Don't skip validation** on user inputs
4. **Don't use raw SQL** - use Eloquent ORM
5. **Don't ignore error handling** - always handle errors gracefully
6. **Don't skip migrations** - always use migrations for schema changes
7. **Don't hardcode URLs or credentials** - use config/env
8. **Don't disable security features** without understanding implications
9. **Don't modify vendor code** - extend through proper channels
10. **Don't deploy untested code** - test locally first

### When Making Changes
1. **Understand the context** - read related code first
2. **Check for existing patterns** - maintain consistency
3. **Consider backwards compatibility** - don't break existing features
4. **Think about security** - validate, sanitize, authorize
5. **Plan for errors** - handle edge cases
6. **Document your changes** - update relevant docs
7. **Test thoroughly** - both happy path and error cases

### Code Quality Checklist
- [ ] Code follows Laravel/React conventions
- [ ] Business logic is in services (not controllers)
- [ ] All inputs are validated
- [ ] Errors are handled gracefully
- [ ] API responses are consistent
- [ ] TypeScript types are defined
- [ ] Code is formatted (Pint for PHP)
- [ ] No debug statements left in code
- [ ] Documentation is updated
- [ ] Tests pass (if applicable)

---

## Quick Reference

### Start Development
```bash
composer install && npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
composer run dev
```

### API Base URLs
- **Local**: `http://localhost:8000/api`
- **Production**: `https://uet-jkuat.onrender.com/api`

### API Authentication
```bash
# Protected endpoints require header:
X-API-Key: {your-api-key-from-env}

# User endpoints (Sanctum):
Authorization: Bearer {token}
```

### Common Directories
- Models: `app/Models/`
- Controllers: `app/Http/Controllers/API/`
- Services: `app/Services/`
- Middleware: `app/Http/Middleware/`
- Routes: `routes/api.php`
- Migrations: `database/migrations/`
- Config: `config/`

### Environment Files
- Backend: `.env` (root)
- Main Frontend: `uetjkuat-funding-platform/.env.local`
- Nuru AI: `nuru-campus-companion/.env.local`

---

## Support & Contact

For questions or issues:
1. Check existing documentation in `/docs`
2. Review markdown files in root directory (100+ docs)
3. Check `storage/logs/laravel.log` for errors
4. Review the extensive implementation docs (COMPLETE_*, ALL_*, FINAL_* files)

---

**Last Updated**: 2025-12-10
**Repository**: UET_JKUAT
**Maintained by**: UET JKUAT Ministry Development Team
