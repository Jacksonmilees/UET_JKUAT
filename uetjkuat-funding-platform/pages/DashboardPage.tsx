import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFinance } from '../contexts/FinanceContext';
import { Route } from '../types';
import api, { accountsApi } from '../services/api';
import {
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Calendar,
  ShieldCheck,
  Target,
  Loader2,
  Link2,
  Plus,
  ShoppingBag,
  History,
  RefreshCw,
  Copy,
  Phone,
  Banknote,
  Receipt,
  Package
} from 'lucide-react';
import RechargeTokens from '../components/RechargeTokens';

interface DashboardPageProps {
  setRoute: (route: Route) => void;
}

// Recharge Modal Component
const RechargeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userPhone?: string;
}> = ({ isOpen, onClose, onSuccess, userPhone }) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userPhone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !phoneNumber) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await api.mpesa.initiate({
        phoneNumber,
        amount: parseFloat(amount),
        type: 'account_recharge',
      });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          setSuccess(false);
          setAmount('');
        }, 2000);
      } else {
        setError(response.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Recharge Account</h3>
            <p className="text-sm text-muted-foreground">Add money to your account via M-Pesa</p>
          </div>
        </div>
        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Payment Initiated!</h4>
            <p className="text-muted-foreground">Check your phone for the M-Pesa prompt</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount (KES)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                required
              />
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 px-3 py-1.5 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">M-Pesa Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium">Cancel</button>
              <button type="submit" disabled={isLoading || !amount || !phoneNumber} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>) : (<><Banknote className="w-4 h-4" />Pay KES {amount || '0'}</>)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ setRoute }) => {
  const { user } = useAuth();
  const { orders } = useCart();
  const {
    getUserTransactions,
    getUserDonations,
    getMandatoryStatus,
    withdrawals,
    tickets,
    isLoading: financeLoading,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'overview' | 'account' | 'purchases' | 'recharge'>('overview');
  const [accountData, setAccountData] = useState<any>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAccountData = useCallback(async () => {
    if (!user) return;
    setAccountLoading(true);
    try {
      const response = await accountsApi.getMyAccount();
      if (response.success && response.data) {
        setAccountData(response.data);
      }
    } catch (error) {
      console.error('Error fetching account:', error);
    } finally {
      setAccountLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAccountData();
    setIsRefreshing(false);
  };

  const userTransactions = useMemo(
    () => getUserTransactions(user?.id),
    [getUserTransactions, user?.id]
  );

  const userDonations = useMemo(
    () => getUserDonations(user?.id).filter(donation => donation.status === 'completed'),
    [getUserDonations, user?.id]
  );

  const userStats = useMemo(() => {
    const totalContributed = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const projectsSupported = new Set(userDonations.map(donation => donation.projectId)).size;
    const recentContributions = userDonations.filter(d => {
      const date = new Date(d.createdAt);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      return diff < 30 * 24 * 60 * 60 * 1000;
    }).length;
    return { totalContributed, projectsSupported, recentContributions };
  }, [userDonations]);

  const mandatoryStatus = useMemo(
    () => getMandatoryStatus(user?.id),
    [getMandatoryStatus, user?.id]
  );

  const displayAccountNumber = accountData?.account_number ||
    (user ? `UET-${user.name?.substring(0, 3).toUpperCase()}-${user.id?.toString().padStart(4, '0')}` : 'N/A');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
        <button
          onClick={() => setRoute({ page: 'login' })}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Login Now
        </button>
      </div>
    );
  }

  const myWithdrawals = withdrawals.filter(withdrawal => withdrawal.requestedBy === user.name);
  const myTickets = tickets.filter(ticket => ticket.phoneNumber === user.phoneNumber);
  const progress = Math.min(100, (mandatoryStatus.contributedAmount / mandatoryStatus.requiredAmount) * 100 || 0);
  const isLoading = financeLoading || accountLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user.name?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <button
              onClick={() => setRoute({ page: 'admin' })}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'account'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wallet className="w-4 h-4" />
          My Account
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
        <button
          onClick={() => setActiveTab('recharge')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recharge'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Recharge Links
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your data...</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {!isLoading && activeTab === 'overview' && (
        <>
          {/* Account Balance Card */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Account Balance</p>
                <p className="text-4xl font-bold text-foreground mb-2">
                  KES {(accountData?.balance || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Account:</span>
                  <code className="bg-background/50 px-2 py-0.5 rounded font-mono text-foreground">
                    {displayAccountNumber}
                  </code>
                  <button
                    onClick={() => copyToClipboard(displayAccountNumber)}
                    className="p-1 hover:bg-background/50 rounded transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Recharge Account
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Contributed"
              value={`KES ${userStats.totalContributed.toLocaleString()}`}
              icon={TrendingUp}
              trend="+12% from last month"
              trendUp={true}
            />
            <StatCard
              title="Projects Supported"
              value={userStats.projectsSupported.toString()}
              icon={Target}
              trend="+3 new projects"
              trendUp={true}
            />
            <StatCard
              title="Active Tickets"
              value={myTickets.filter(t => t.status === 'active').length.toString()}
              icon={CreditCard}
              trend="Next draw in 2 days"
            />
            <StatCard
              title="Transactions"
              value={userTransactions.length.toString()}
              icon={Clock}
              trend="Updated just now"
            />
          </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

        {/* Mandatory Contribution (Large Card) */}
        <div className="md:col-span-2 lg:col-span-4 bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Mandatory Contribution</h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${mandatoryStatus.isCleared
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
              {mandatoryStatus.isCleared ? 'Completed' : 'Pending'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Progress</p>
                <p className="text-2xl font-bold">
                  KES {mandatoryStatus.contributedAmount.toLocaleString()}
                  <span className="text-sm text-muted-foreground font-normal"> / {mandatoryStatus.requiredAmount.toLocaleString()}</span>
                </p>
              </div>
              <p className="text-sm font-medium text-primary">{Math.round(progress)}%</p>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setRoute({ page: 'home' })}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                {mandatoryStatus.isCleared ? 'Contribute More' : 'Complete Payment'}
              </button>
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity (Side List) */}
        <div className="md:col-span-2 lg:col-span-3 bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <button
              onClick={() => setActiveTab('purchases')}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {userTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.status === 'completed'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                    {tx.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{tx.projectTitle || 'Contribution'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">KES {tx.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground capitalize">{tx.type}</p>
                </div>
              </div>
            ))}

            {userTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tickets */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">My Tickets</h3>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {myTickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xs">
                    T
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ticket.ticketNumber}</p>
                    <p className="text-xs text-muted-foreground">Expires {new Date(ticket.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
            {myTickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets found.</p>}
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Withdrawals</h3>
            <button className="text-sm text-primary hover:underline">Request New</button>
          </div>
          <div className="space-y-3">
            {myWithdrawals.slice(0, 3).map(w => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">KES {w.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${w.status === 'approved' ? 'bg-green-100 text-green-700' :
                    w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {w.status}
                </span>
              </div>
            ))}
            {myWithdrawals.length === 0 && <p className="text-sm text-muted-foreground">No withdrawal requests.</p>}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Account Tab */}
      {!isLoading && activeTab === 'account' && (
        <div className="space-y-6">
          {/* Account Card */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Your Account Number</p>
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-mono font-bold text-foreground bg-background/50 px-4 py-2 rounded-lg">
                      {displayAccountNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(displayAccountNumber)}
                      className="p-2 bg-background/50 rounded-lg hover:bg-background transition-colors"
                      title="Copy account number"
                    >
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-4xl font-bold text-foreground">
                    KES {(accountData?.balance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {user.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phoneNumber || 'Not set'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Recharge Account
                </button>
                <button
                  onClick={() => setRoute({ page: 'merch' })}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-medium"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Account Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Account Holder</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{user.phoneNumber || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Account Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Contributed</span>
                  <span className="font-medium text-green-600">+KES {userStats.totalContributed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Projects Funded</span>
                  <span className="font-medium">{userStats.projectsSupported}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Orders Placed</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-medium">{userTransactions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase History Tab */}
      {!isLoading && activeTab === 'purchases' && (
        <div className="space-y-6">
          {/* Contribution History */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Project Contributions
            </h4>
            {userDonations.length > 0 ? (
              <div className="space-y-3">
                {userDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.projectTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">KES {donation.amount.toLocaleString()}</p>
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No project contributions yet</p>
                <button
                  onClick={() => setRoute({ page: 'home' })}
                  className="mt-3 text-primary hover:underline text-sm"
                >
                  Browse Projects
                </button>
              </div>
            )}
          </div>

          {/* Merchandise Orders */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Merchandise Orders
            </h4>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.items.length} item(s)</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id} • {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">KES {order.totalAmount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No merchandise orders yet</p>
                <button
                  onClick={() => setRoute({ page: 'merch' })}
                  className="mt-3 text-primary hover:underline text-sm"
                >
                  Browse Shop
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recharge Links Tab */}
      {!isLoading && activeTab === 'recharge' && (
        <RechargeTokens />
      )}

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onSuccess={fetchAccountData}
        userPhone={user.phoneNumber}
      />
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold">{value}</p>
      {trend && (
        <p className={`text-xs flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </p>
      )}
    </div>
  </div>
);

export default DashboardPage;
