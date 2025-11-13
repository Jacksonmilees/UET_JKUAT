# API Integration Guide

This document explains how the frontend connects to the Laravel backend API.

## Environment Configuration

Create a `.env.local` file in the `uetjkuat-funding-platform` directory with the following:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=your-api-key-here
VITE_APP_ENV=development
```

For production:
```env
VITE_API_BASE_URL=https://api.uetjkuat.org/api
VITE_API_KEY=your-production-api-key
VITE_APP_ENV=production
```

## API Service Layer

The API service is located at `services/api.ts` and provides:

- **Authentication**: Login, register, logout, get current user
- **Projects**: CRUD operations for fundraising projects
- **Donations**: Get user donations, project donations
- **MPesa**: Initiate STK push, check payment status
- **Accounts**: Get account balance, transactions
- **Withdrawals**: Initiate withdrawal requests
- **Tickets**: Get user tickets
- **Users**: Admin user management
- **News**: CRUD operations for news articles

## Context Updates

All contexts have been updated to use real API calls:

1. **AuthContext** (`contexts/AuthContext.tsx`)
   - Uses `api.auth.login()`, `api.auth.register()`, `api.auth.getCurrentUser()`
   - Manages authentication tokens in localStorage
   - Auto-refreshes user data on mount

2. **ProjectContext** (`contexts/ProjectContext.tsx`)
   - Uses `api.projects.getAll()`, `api.projects.getById()`, etc.
   - Loads projects from backend on mount
   - Handles project contributions through finance context

3. **FinanceContext** (`contexts/FinanceContext.tsx`)
   - Uses `api.mpesa.initiateSTKPush()`, `api.mpesa.checkStatus()`
   - Uses `api.accounts.getTransactions()`, `api.accounts.getMyAccount()`
   - Uses `api.withdrawals.initiate()`, `api.withdrawals.getAll()`
   - Uses `api.tickets.getMyTickets()`
   - Manages all financial data and MPesa sessions

4. **NewsContext** (`contexts/NewsContext.tsx`)
   - Uses `api.news.getAll()`, `api.news.create()`, `api.news.update()`, `api.news.delete()`

## Component Updates

### ContributionModal
- Now initiates real MPesa STK push through `initiateProjectContribution`
- Shows `MpesaPaymentStatus` component during payment
- Polls payment status until completion

### MpesaPaymentStatus
- Displays payment status (pending/completed/failed)
- Polls backend for status updates
- Handles payment completion callbacks

### DashboardPage
- Displays real account balances
- Shows real transaction history
- Shows real withdrawal requests
- Shows real tickets

## Backend API Endpoints Expected

The frontend expects the following Laravel API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/auth/mandatory-contribution` - Check mandatory contribution status

### Projects
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/{id}` - Get project by ID
- `POST /api/v1/projects` - Create project (admin)
- `PUT /api/v1/projects/{id}` - Update project (admin)
- `DELETE /api/v1/projects/{id}` - Delete project (admin)

### Donations
- `GET /api/v1/donations/my` - Get user's donations
- `GET /api/v1/projects/{id}/donations` - Get project donations

### MPesa
- `POST /api/v1/payments/mpesa` - Initiate STK push
- `GET /api/v1/payments/mpesa/status/{checkoutRequestId}` - Check payment status

### Accounts
- `GET /api/v1/accounts/my` - Get user's account
- `GET /api/v1/accounts/balance` - Get account balance
- `GET /api/v1/transactions/my` - Get user's transactions
- `GET /api/v1/accounts/{id}/transactions` - Get account transactions

### Withdrawals
- `POST /api/v1/withdrawals/initiate` - Initiate withdrawal
- `GET /api/v1/withdrawals` - Get user's withdrawals
- `GET /api/v1/withdrawals/{id}` - Get withdrawal by ID
- `POST /api/v1/withdrawals/send-otp` - Send OTP for withdrawal

### Tickets
- `GET /api/v1/tickets/my` - Get user's tickets
- `GET /api/v1/tickets/{id}` - Get ticket by ID

### Users (Admin)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `POST /api/v1/users/{id}/toggle-status` - Toggle user status
- `POST /api/v1/users/{id}/toggle-role` - Toggle user role

### News
- `GET /api/v1/news` - List all news articles
- `GET /api/v1/news/{id}` - Get article by ID
- `POST /api/v1/news` - Create article (admin)
- `PUT /api/v1/news/{id}` - Update article (admin)
- `DELETE /api/v1/news/{id}` - Delete article (admin)

## Authentication

The API service automatically:
- Stores authentication tokens in localStorage
- Includes tokens in Authorization header for authenticated requests
- Includes API key in X-API-Key header for protected endpoints
- Removes tokens on logout

## Error Handling

All API calls return a standardized response:
```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

Components handle errors by:
- Displaying error messages to users
- Logging errors to console
- Showing loading states during API calls

## Testing

To test the integration:

1. Start the Laravel backend server
2. Configure `.env.local` with correct API URL
3. Run `npm run dev` in the frontend directory
4. Test login/registration
5. Test project contributions with MPesa
6. Test dashboard features

## Notes

- All API calls are async and use try/catch for error handling
- Loading states are managed in contexts
- Data is automatically refreshed after mutations
- MPesa payment status is polled every 3 seconds until completion




