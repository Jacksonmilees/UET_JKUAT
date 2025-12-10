import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { Download, RefreshCw, Calendar, TrendingUp, TrendingDown, DollarSign, Banknote, Loader2 } from 'lucide-react';
import { GridSkeleton, TableSkeleton } from '../ui/Skeleton';

const HAS_API_KEY = !!import.meta.env.VITE_API_KEY;

type Tx = {
  id: string | number;
  amount: number;
  type: 'credit' | 'debit' | string;
  status: string;
  reference?: string;
  payment_method?: string;
  payer_name?: string;
  phone_number?: string;
  created_at?: string;
  account?: {
    reference?: string;
    name?: string;
    type?: string;
  };
};

type Withdrawal = {
  id: string | number;
  amount: number;
  phone_number?: string;
  status: string;
  created_at?: string;
};

type Project = {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  account_number?: string;
  status?: string;
};

const Stat: React.FC<{ label: string; value: string; type?: 'neutral' | 'positive' | 'negative' }> = ({ label, value, type = 'neutral' }) => (
  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      {type === 'positive' && <TrendingUp className="w-4 h-4 text-green-500" />}
      {type === 'negative' && <TrendingDown className="w-4 h-4 text-red-500" />}
      {type === 'neutral' && <DollarSign className="w-4 h-4 text-muted-foreground" />}
    </div>
    <div className={`text-2xl font-bold ${type === 'positive' ? 'text-green-600 dark:text-green-400' :
        type === 'negative' ? 'text-red-600 dark:text-red-400' :
          'text-foreground'
      }`}>{value}</div>
  </div>
);

const Table: React.FC<{
  columns: string[];
  rows: React.ReactNode[][];
}> = ({ columns, rows }) => (
  <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
    <table className="min-w-full">
      <thead className="bg-secondary/50 border-b border-border">
        <tr>
          {columns.map((c) => (
            <th key={c} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-secondary/30 transition-colors">
            {r.map((cell, j) => (
              <td key={j} className="px-6 py-4 text-sm text-foreground">
                {cell}
              </td>
            ))}
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td className="px-6 py-8 text-center text-sm text-muted-foreground" colSpan={columns.length}>
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const KES = (n: number) => `KES ${Number(n || 0).toLocaleString()}`;

const FinanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [paybillBalance, setPaybillBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [transactionSummary, setTransactionSummary] = useState<any>(null);

  const loadPaybillBalance = async (forceRefresh = false) => {
    setLoadingBalance(true);
    try {
      // Try using the new admin dashboard endpoint first
      if (api.admin?.getPaybillBalance) {
        const response = await api.admin.getPaybillBalance(forceRefresh);
        if (response.success && response.data) {
          setPaybillBalance(response.data.balance || 0);
          return;
        }
      }

      // Fallback to the old endpoint
      const response = await api.mpesa.getBalance();
      if (response.success && response.data) {
        setPaybillBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error('Error loading paybill balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      if (api.admin?.getDashboardStats) {
        const response = await api.admin.getDashboardStats();
        if (response.success && response.data) {
          setDashboardStats(response.data);
        }
      }

      if (api.admin?.getTransactionSummary) {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await api.admin.getTransactionSummary(params);
        if (response.success && response.data) {
          setTransactionSummary(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load paybill balance and dashboard stats
      loadPaybillBalance();
      loadDashboardStats();

      // All endpoints are public - no API key needed
      const [txRes, wdRes, projRes] = await Promise.all([
        api.transactions.getAll({
          sort_by: 'created_at',
          sort_direction: 'desc',
          ...(startDate ? { start_date: startDate } : {}),
          ...(endDate ? { end_date: endDate } : {}),
        }),
        api.withdrawals.getAll(),
        api.projects.getAll(),
      ]);

      if (txRes.success && Array.isArray(txRes.data)) {
        setTransactions(txRes.data as any);
      } else if (!txRes.success) {
        setError(txRes.error || 'Failed to load transactions');
      }

      if (wdRes.success && Array.isArray(wdRes.data)) {
        setWithdrawals(wdRes.data as any);
      }

      if (projRes.success && Array.isArray(projRes.data)) {
        setProjects(projRes.data as any);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    // Use transaction summary from API if available
    if (transactionSummary) {
      return {
        credit: transactionSummary.total_credit || 0,
        debit: transactionSummary.total_debit || 0,
        net: (transactionSummary.total_credit || 0) - (transactionSummary.total_debit || 0),
        count: transactionSummary.total_count || 0,
      };
    }

    // Fallback to local calculation
    const credit = transactions
      .filter((t) => (t.type || '').toLowerCase() === 'credit')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const debit = transactions
      .filter((t) => (t.type || '').toLowerCase() === 'debit')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const net = credit - debit;
    return { credit, debit, net, count: transactions.length };
  }, [transactions, transactionSummary]);

  const recentTxRows: React.ReactNode[][] = (transactions || []).slice(0, 12).map((t) => [
    <div>
      <span className="font-medium text-foreground block">{t.payer_name || t.account?.name || '—'}</span>
      <span className="text-xs text-muted-foreground">{t.account?.reference || t.phone_number || ''}</span>
    </div>,
    <span className="font-mono">{KES(t.amount)}</span>,
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${(t.type || '').toLowerCase() === 'credit'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }`}>{(t.type || '').toUpperCase()}</span>,
    <span className="capitalize text-muted-foreground">{t.status || '—'}</span>,
    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{t.reference || '—'}</code>,
    <span className="text-muted-foreground text-xs">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</span>,
  ]);

  const withdrawalRows: React.ReactNode[][] = (withdrawals || []).slice(0, 10).map((w) => [
    <span className="font-mono text-xs">#{w.id}</span>,
    <span className="font-mono">{KES(w.amount)}</span>,
    w.phone_number || '—',
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${w.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
        w.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
          'bg-secondary text-secondary-foreground'
      }`}>{w.status}</span>,
    <span className="text-muted-foreground text-xs">{w.created_at ? new Date(w.created_at).toLocaleString() : '—'}</span>,
  ]);

  const projectRows: React.ReactNode[][] = (projects || []).map((p) => [
    <span className="font-medium text-foreground">{p.title}</span>,
    <span className="font-mono text-green-600 dark:text-green-400">{KES(p.current_amount || 0)}</span>,
    <span className="font-mono text-muted-foreground">{KES(p.target_amount || 0)}</span>,
    <span className="font-mono text-xs">{p.account_number || '—'}</span>,
    <span className="capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{p.status || 'active'}</span>,
  ]);

  return (
    <div className="space-y-8">
      {!HAS_API_KEY && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm">
          Admin data requires API access. Set backend API_KEY and frontend VITE_API_KEY to enable live transactions, withdrawals, projects, and reports.
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Finance Overview</h2>
          <p className="text-sm text-muted-foreground">Live totals, transactions, withdrawals, and projects.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-input rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 p-0 w-32 text-foreground"
            />
            <span className="text-muted-foreground text-sm">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 p-0 w-32 text-foreground"
            />
          </div>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Apply'}</span>
          </button>
          <a
            href={`/api/v1/reports/finance${(startDate || endDate) ? `?${new URLSearchParams({ ...(startDate ? { start_date: startDate } : {}), ...(endDate ? { end_date: endDate } : {}) }).toString()}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2 border border-border shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Paybill Balance Card */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border border-green-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Banknote className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">M-Pesa Paybill Balance</span>
              <p className="text-xs text-muted-foreground">Live balance from Safaricom</p>
            </div>
          </div>
          <button
            onClick={loadPaybillBalance}
            disabled={loadingBalance}
            className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
          >
            {loadingBalance ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <RefreshCw className="w-4 h-4 text-green-600" />}
          </button>
        </div>
        <div className="text-3xl font-bold text-green-600">{KES(paybillBalance)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat label="Total Transactions" value={totals.count.toString()} type="neutral" />
        <Stat label="Total Inflow" value={KES(totals.credit)} type="positive" />
        <Stat label="Total Outflow" value={KES(totals.debit)} type="negative" />
        <Stat label="Net Balance" value={KES(totals.net)} type={totals.net >= 0 ? 'positive' : 'negative'} />
      </div>

      {/* Additional Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardStats.total_users && (
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">Total Users</div>
              <div className="text-2xl font-bold text-foreground">{dashboardStats.total_users}</div>
            </div>
          )}
          {dashboardStats.total_projects !== undefined && (
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">Active Projects</div>
              <div className="text-2xl font-bold text-foreground">{dashboardStats.total_projects}</div>
            </div>
          )}
          {dashboardStats.total_withdrawals !== undefined && (
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">Pending Withdrawals</div>
              <div className="text-2xl font-bold text-foreground">{dashboardStats.total_withdrawals}</div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <Table
          columns={['User/Payer', 'Amount', 'Type', 'Status', 'Reference', 'Created']}
          rows={recentTxRows}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Withdrawals</h3>
          <Table
            columns={['ID', 'Amount', 'Phone', 'Status', 'Created']}
            rows={withdrawalRows}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Projects</h3>
          <Table
            columns={['Project', 'Current', 'Target', 'Account', 'Status']}
            rows={projectRows}
          />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;


