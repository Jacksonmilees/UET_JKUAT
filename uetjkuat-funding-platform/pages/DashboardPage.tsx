import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFinance } from '../contexts/FinanceContext';
import { Route } from '../types';
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
  Link2
} from 'lucide-react';
import RechargeTokens from '../components/RechargeTokens';

interface DashboardPageProps {
  setRoute: (route: Route) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setRoute }) => {
  const { user } = useAuth();
  const { orders } = useCart();
  const {
    getUserTransactions,
    getUserDonations,
    getMandatoryStatus,
    mpesaSessions,
    accounts,
    withdrawals,
    tickets,
    isLoading,
  } = useFinance();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'recharge'>('overview');

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
      return diff < 30 * 24 * 60 * 60 * 1000; // Last 30 days
    }).length;
    return { totalContributed, projectsSupported, recentContributions };
  }, [userDonations]);

  const mandatoryStatus = useMemo(
    () => getMandatoryStatus(user?.id),
    [getMandatoryStatus, user?.id]
  );

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user.name?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
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
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('recharge')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
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
            <select
              className="text-sm bg-transparent border-none text-muted-foreground focus:ring-0 cursor-pointer"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="space-y-6">
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

      {/* Recharge Links Tab */}
      {!isLoading && activeTab === 'recharge' && (
        <RechargeTokens />
      )}
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
