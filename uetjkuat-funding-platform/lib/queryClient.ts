import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache kept for 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 1, // Retry failed requests once
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Auth
  currentUser: ['currentUser'] as const,
  mandatoryStatus: ['mandatoryStatus'] as const,

  // Projects
  projects: ['projects'] as const,
  project: (id: number) => ['projects', id] as const,
  projectDonations: (id: number) => ['projects', id, 'donations'] as const,

  // News
  news: ['news'] as const,
  newsItem: (id: number) => ['news', id] as const,

  // Announcements
  announcements: ['announcements'] as const,
  announcement: (id: number) => ['announcements', id] as const,

  // Accounts
  accounts: ['accounts'] as const,
  account: (id: number) => ['accounts', id] as const,
  myAccount: ['myAccount'] as const,
  accountBalance: ['accountBalance'] as const,
  accountTransactions: (id: number) => ['accounts', id, 'transactions'] as const,

  // Transactions
  transactions: (params?: Record<string, string>) => ['transactions', params] as const,
  transaction: (id: string) => ['transactions', id] as const,

  // Users
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,

  // Admin
  dashboardStats: ['admin', 'dashboard', 'stats'] as const,
  paybillBalance: ['admin', 'paybill', 'balance'] as const,
  transactionSummary: (params?: Record<string, string>) => ['admin', 'transactions', 'summary', params] as const,

  // Wallet
  walletBalance: ['wallet', 'balance'] as const,
  walletTransactions: (params?: Record<string, any>) => ['wallet', 'transactions', params] as const,
  walletStatistics: ['wallet', 'statistics'] as const,

  // M-Pesa
  mpesaTransactions: (params?: Record<string, any>) => ['mpesa', 'transactions', params] as const,

  // Merchandise
  merchandise: ['merchandise'] as const,
  merchandiseItem: (id: string) => ['merchandise', id] as const,

  // Orders
  orders: ['orders'] as const,
  myOrders: ['myOrders'] as const,
  order: (id: string) => ['orders', id] as const,

  // Members
  members: ['members'] as const,
  member: (id: string) => ['members', id] as const,

  // Settings
  settings: ['settings'] as const,
  publicSettings: ['settings', 'public'] as const,

  // Withdrawals
  withdrawals: ['withdrawals'] as const,
  withdrawal: (id: number) => ['withdrawals', id] as const,

  // Tickets
  tickets: ['tickets'] as const,
  myTickets: ['myTickets'] as const,
  ticket: (id: number) => ['tickets', id] as const,

  // Recharge Tokens
  rechargeTokens: ['rechargeTokens'] as const,
  rechargeToken: (id: number) => ['rechargeTokens', id] as const,

  // Reports
  financialReport: (params?: Record<string, string>) => ['reports', 'financial', params] as const,
  projectsReport: (id?: string | number) => ['reports', 'projects', id] as const,
};
