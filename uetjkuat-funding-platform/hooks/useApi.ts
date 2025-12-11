import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api from '../services/api';
import { queryKeys } from '../lib/queryClient';

// Generic query hook
export function useApiQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<{ data?: T; success: boolean; error?: string; message?: string }>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      if (!response.success) {
        throw new Error(response.error || response.message || 'Request failed');
      }
      return response.data as T;
    },
    ...options,
  });
}

// Projects
export const useProjects = () => useApiQuery(queryKeys.projects, api.projects.getAll);
export const useProject = (id: number) => useApiQuery(queryKeys.project(id), () => api.projects.getById(id), { enabled: !!id });

// News
export const useNews = () => useApiQuery(queryKeys.news, api.news.getAll);
export const useNewsItem = (id: number) => useApiQuery(queryKeys.newsItem(id), () => api.news.getById(id), { enabled: !!id });

// Announcements
export const useAnnouncements = () => useApiQuery(queryKeys.announcements, api.announcements.getAll);
export const useAnnouncement = (id: number) => useApiQuery(queryKeys.announcement(id), () => api.announcements.getById(id), { enabled: !!id });

// Accounts
export const useAccounts = () => useApiQuery(queryKeys.accounts, api.accounts.getAll);
export const useAccount = (id: number) => useApiQuery(queryKeys.account(id), () => api.accounts.getById(id), { enabled: !!id });
export const useMyAccount = () => useApiQuery(queryKeys.myAccount, api.accounts.getMyAccount);

// Transactions
export const useTransactions = (params?: Record<string, string>) =>
  useApiQuery(queryKeys.transactions(params), () => api.transactions.getAll(params));

// Users
export const useUsers = () => useApiQuery(queryKeys.users, api.users.getAll);
export const useUser = (id: number) => useApiQuery(queryKeys.user(id), () => api.users.getById(id), { enabled: !!id });

// Admin Dashboard
export const useDashboardStats = () => useApiQuery(queryKeys.dashboardStats, api.admin.getDashboardStats);
export const usePaybillBalance = (forceRefresh = false) =>
  useApiQuery(queryKeys.paybillBalance, () => api.admin.getPaybillBalance(forceRefresh));

// Wallet
export const useWalletBalance = () => useApiQuery(queryKeys.walletBalance, () => api.get('/v1/wallet/balance').then(r => r.data));
export const useWalletTransactions = (params?: Record<string, any>) =>
  useApiQuery(queryKeys.walletTransactions(params), () => api.get(`/v1/wallet/transactions?${new URLSearchParams(params as any)}`).then(r => r.data));
export const useWalletStatistics = () => useApiQuery(queryKeys.walletStatistics, () => api.get('/v1/wallet/statistics').then(r => r.data));

// Merchandise
export const useMerchandise = () => useApiQuery(queryKeys.merchandise, api.merchandise.getAll);
export const useMerchandiseItem = (id: string) => useApiQuery(queryKeys.merchandiseItem(id), () => api.merchandise.getById(id), { enabled: !!id });

// Orders
export const useOrders = () => useApiQuery(queryKeys.orders, api.orders.getAll);
export const useMyOrders = () => useApiQuery(queryKeys.myOrders, api.orders.getMy);

// Members
export const useMembers = () => useApiQuery(queryKeys.members, api.members.getAll);

// Settings
export const useSettings = () => useApiQuery(queryKeys.settings, api.settings.getAll);
export const usePublicSettings = () => useApiQuery(queryKeys.publicSettings, api.settings.getPublic);

// Withdrawals
export const useWithdrawals = () => useApiQuery(queryKeys.withdrawals, api.withdrawals.getAll);

// Tickets
export const useMyTickets = () => useApiQuery(queryKeys.myTickets, api.tickets.getMyTickets);

// Recharge Tokens
export const useRechargeTokens = () => useApiQuery(queryKeys.rechargeTokens, () => api.get('/v1/recharge-tokens').then(r => r.data));

// Mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.projects.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(variables.id) });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

// Similar mutation hooks for other entities
export const useCreateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.news.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.news.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
      queryClient.invalidateQueries({ queryKey: queryKeys.newsItem(variables.id) });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.news.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.announcements.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSettings });
    },
  });
};

// Wallet mutations
export const useSettleFunds = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => api.post('/v1/wallet/settle-funds', { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletStatistics });
    },
  });
};

export const usePayForProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, amount }: { projectId: number; amount: number }) =>
      api.post('/v1/wallet/pay-project', { project_id: projectId, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};
