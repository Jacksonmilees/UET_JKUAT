import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

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

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className="mt-1 text-2xl font-bold text-gray-800">{value}</div>
  </div>
);

const Table: React.FC<{
  columns: string[];
  rows: React.ReactNode[][];
}> = ({ columns, rows }) => (
  <div className="overflow-x-auto border border-gray-100 rounded-lg">
    <table className="min-w-full bg-white">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((c) => (
            <th key={c} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
            {r.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-sm text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={columns.length}>
              No data
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!HAS_API_KEY) {
        // Without an API key, protected endpoints will 401. Show empty state.
        setTransactions([]);
        setWithdrawals([]);
        setProjects([]);
        return;
      }
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
    const credit = transactions
      .filter((t) => (t.type || '').toLowerCase() === 'credit')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const debit = transactions
      .filter((t) => (t.type || '').toLowerCase() === 'debit')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const net = credit - debit;
    return { credit, debit, net };
  }, [transactions]);

  const recentTxRows: React.ReactNode[][] = (transactions || []).slice(0, 12).map((t) => [
    <span className="font-medium">{t.account?.reference || t.account?.name || '—'}</span>,
    KES(t.amount),
    <span className={
      (t.type || '').toLowerCase() === 'credit'
        ? 'text-green-600 font-semibold'
        : 'text-red-600 font-semibold'
    }>{(t.type || '').toUpperCase()}</span>,
    <span className="capitalize">{t.status || '—'}</span>,
    <code className="text-xs">{t.reference || '—'}</code>,
    t.created_at ? new Date(t.created_at).toLocaleString() : '—',
  ]);

  const withdrawalRows: React.ReactNode[][] = (withdrawals || []).slice(0, 10).map((w) => [
    `#${w.id}`,
    KES(w.amount),
    w.phone_number || '—',
    <span className="capitalize">{w.status}</span>,
    w.created_at ? new Date(w.created_at).toLocaleString() : '—',
  ]);

  const projectRows: React.ReactNode[][] = (projects || []).map((p) => [
    <span className="font-medium">{p.title}</span>,
    KES(p.current_amount || 0),
    KES(p.target_amount || 0),
    <span>{p.account_number || '—'}</span>,
    <span className="capitalize">{p.status || 'active'}</span>,
  ]);

  return (
    <div className="space-y-8">
      {!HAS_API_KEY && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          Admin data requires API access. Set backend API_KEY and frontend VITE_API_KEY to enable live transactions, withdrawals, projects, and reports.
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finance Overview</h2>
          <p className="text-sm text-gray-600">Live totals, transactions, withdrawals, and projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
          <button
            onClick={load}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Apply'}
          </button>
          <a
            href={`/api/v1/reports/finance${(startDate || endDate) ? `?${new URLSearchParams({ ...(startDate ? { start_date: startDate } : {}), ...(endDate ? { end_date: endDate } : {}) }).toString()}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-md bg-gray-800 text-white font-semibold hover:bg-gray-900"
          >
            Export PDF
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Inflow" value={KES(totals.credit)} />
        <Stat label="Total Outflow" value={KES(totals.debit)} />
        <Stat label="Net" value={KES(totals.net)} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        <Table
          columns={['Account', 'Amount', 'Type', 'Status', 'Reference', 'Created']}
          rows={recentTxRows}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Withdrawals</h3>
          <Table
            columns={['ID', 'Amount', 'Phone', 'Status', 'Created']}
            rows={withdrawalRows}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
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


