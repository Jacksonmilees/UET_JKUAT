import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Transaction {
  id: number;
  transaction_id: string;
  reference: string;
  amount: number;
  phone_number: string;
  payer_name: string;
  status: string;
  type: string;
  created_at: string;
  processed_at: string;
  metadata?: {
    bill_reference?: string;
    transaction_type?: string;
    imported_from?: string;
  };
}

interface MpesaTransactionsManagementProps {
  onRefresh?: () => void;
}

const MpesaTransactionsManagement: React.FC<MpesaTransactionsManagementProps> = ({ onRefresh }) => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ count: 0, total_amount: 0, completed_amount: 0 });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  
  // Filters
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Add transaction modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    trans_id: '',
    amount: '',
    phone_number: '',
    payer_name: '',
    trans_time: '',
    bill_ref: ''
  });
  
  // Import state
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, per_page: pagination.per_page };
      
      if (searchPhone) params.phone = searchPhone;
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      
      const response = await api.mpesa.getAllTransactions(params);
      
      if (response.success && response.data) {
        setTransactions(response.data.data || []);
        setTotals(response.data.totals || { count: 0, total_amount: 0, completed_amount: 0 });
        setPagination(response.data.pagination || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      showError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [searchPhone, statusFilter, fromDate, toDate, pagination.per_page, showError]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions(pagination.current_page);
    setRefreshing(false);
    showSuccess('Transactions refreshed');
  };

  const handleSearch = () => {
    fetchTransactions(1);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.trans_id || !newTransaction.amount || !newTransaction.phone_number) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setAddingTransaction(true);
      const response = await api.mpesa.addTransaction({
        trans_id: newTransaction.trans_id,
        amount: parseFloat(newTransaction.amount),
        phone_number: newTransaction.phone_number,
        payer_name: newTransaction.payer_name || undefined,
        trans_time: newTransaction.trans_time || undefined,
        bill_ref: newTransaction.bill_ref || undefined
      });

      if (response.success) {
        showSuccess('Transaction added successfully');
        setShowAddModal(false);
        setNewTransaction({ trans_id: '', amount: '', phone_number: '', payer_name: '', trans_time: '', bill_ref: '' });
        fetchTransactions();
        onRefresh?.();
      } else {
        showError(response.error || 'Failed to add transaction');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to add transaction');
    } finally {
      setAddingTransaction(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      showError('Please paste transaction data');
      return;
    }

    try {
      setImporting(true);
      showInfo('Processing import...');

      // Parse the import data (expecting JSON array or CSV-like format)
      let transactions: any[] = [];
      
      try {
        // Try JSON first
        transactions = JSON.parse(importData);
      } catch {
        // Try CSV/line format: trans_id,amount,phone,name,date
        const lines = importData.trim().split('\n');
        transactions = lines.map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            trans_id: parts[0],
            amount: parseFloat(parts[1]) || 0,
            phone_number: parts[2] || '',
            payer_name: parts[3] || '',
            trans_time: parts[4] || '',
            bill_ref: parts[5] || ''
          };
        }).filter(t => t.trans_id && t.amount > 0);
      }

      if (transactions.length === 0) {
        showError('No valid transactions found in import data');
        return;
      }

      const response = await api.mpesa.syncFromOrgPortal(transactions);

      if (response.success && response.data) {
        const { imported, skipped, failed, total_amount } = response.data;
        showSuccess(`Import complete: ${imported} imported, ${skipped} skipped, ${failed} failed. Total: KES ${total_amount.toLocaleString()}`);
        setShowImportModal(false);
        setImportData('');
        fetchTransactions();
        onRefresh?.();
      } else {
        showError(response.error || 'Import failed');
      }
    } catch (error: any) {
      showError(error.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-yellow-500 text-xs"><Clock className="w-3 h-3" /> Pending</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" /> Failed</span>;
      default:
        return <span className="text-muted-foreground text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">M-Pesa Transactions</h2>
          <p className="text-muted-foreground text-sm">
            {totals.count} transactions • KES {totals.total_amount.toLocaleString()} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by phone..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="min-w-[150px]">
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="min-w-[150px]">
            <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="min-w-[150px]">
            <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No Transactions Found</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              No M-Pesa transactions match your filters. Try adjusting your search criteria or import transactions from the Org Portal.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Trans ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Phone</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Reference</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{txn.reference || txn.transaction_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{txn.phone_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{txn.payer_name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-green-500">
                          KES {txn.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {txn.metadata?.bill_reference || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(txn.processed_at || txn.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTransactions(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => fetchTransactions(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add M-Pesa Transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Transaction ID *</label>
                <input
                  type="text"
                  value={newTransaction.trans_id}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, trans_id: e.target.value }))}
                  placeholder="e.g., TL91000000"
                  className="w-full px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Amount (KES) *</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="e.g., 100"
                  min="1"
                  className="w-full px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phone Number *</label>
                <input
                  type="text"
                  value={newTransaction.phone_number}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="e.g., 254712345678"
                  className="w-full px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Payer Name</label>
                <input
                  type="text"
                  value={newTransaction.payer_name}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, payer_name: e.target.value }))}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Transaction Date</label>
                <input
                  type="datetime-local"
                  value={newTransaction.trans_time}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, trans_time: e.target.value }))}
                  className="w-full px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Bill Reference</label>
                <input
                  type="text"
                  value={newTransaction.bill_ref}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, bill_ref: e.target.value }))}
                  placeholder="e.g., DONATION"
                  className="w-full px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTransaction}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingTransaction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Import Transactions from Org Portal</h3>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">How to import:</p>
                    <ol className="list-decimal list-inside text-muted-foreground mt-1 space-y-1">
                      <li>Go to Safaricom Org Portal → Reports → Transaction Statement</li>
                      <li>Download your transactions</li>
                      <li>Paste the data below in CSV format: <code className="text-xs bg-secondary px-1 rounded">trans_id,amount,phone,name,date,reference</code></li>
                      <li>Or paste as JSON array</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Transaction Data</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={`Paste CSV or JSON data here...\n\nCSV Example:\nTL91234567,100,254712345678,John Doe,2025-12-09,DONATION\n\nJSON Example:\n[{"trans_id":"TL91234567","amount":100,"phone_number":"254712345678","payer_name":"John Doe"}]`}
                  rows={10}
                  className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || !importData.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Import Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MpesaTransactionsManagement;
