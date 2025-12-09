import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { useNews } from '../contexts/NewsContext';
import { useFinance } from '../contexts/FinanceContext';
import UserManagement from '../components/admin/UserManagement';
import ProjectManagement from '../components/admin/ProjectManagement';
import NewsManagement from '../components/admin/NewsManagement';
import FinanceDashboard from '../components/admin/FinanceDashboard';
import MembersManagement from '../components/admin/MembersManagement';
import WithdrawalManagement from '../components/admin/WithdrawalManagement';
import AccountManagement from '../components/admin/AccountManagement';
import TransactionManagement from '../components/admin/TransactionManagement';
import TicketManagement from '../components/admin/TicketManagement';
import ReportsManagement from '../components/admin/ReportsManagement';
import MemberDirectory from '../components/admin/MemberDirectory';
import MerchandiseManagement from '../components/admin/MerchandiseManagement';
import OrderManagement from '../components/admin/OrderManagement';
import AnnouncementManagement from '../components/admin/AnnouncementManagement';
import SemesterManagement from '../components/admin/SemesterManagement';
import SettingsManagement from '../components/admin/SettingsManagement';
import EditProjectModal from '../components/admin/EditProjectModal';
import EditNewsModal from '../components/admin/EditNewsModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { OverviewSkeleton, TransactionSkeleton } from '../components/ui/Skeleton';
import { Route, Project, NewsArticle, User } from '../types';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  FilePlus,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Ticket,
  TrendingUp,
  Newspaper,
  AlertCircle,
  CheckCircle,
  LogOut,
  Menu,
  X,
  Calendar,
  ShoppingBag,
  Package,
  Megaphone,
  Home,
  RefreshCw,
  Banknote,
  Settings
} from 'lucide-react';

interface AdminPageProps {
  setRoute: (route: Route) => void;
}

type AdminTab = 'overview' | 'users' | 'projects' | 'news' | 'finance' | 'members' |
  'withdrawals' | 'accounts' | 'transactions' | 'tickets' | 'reports' | 'directory' |
  'merchandise' | 'orders' | 'announcements' | 'semesters' | 'settings';
type DeletableItem = { type: 'user' | 'project' | 'news', id: number, name: string };

const AdminPage: React.FC<AdminPageProps> = ({ setRoute }) => {
  const { user, users, deleteUser, logout } = useAuth();
  const { projects, deleteProject } = useProjects();
  const { articles, deleteArticle } = useNews();
  const { transactions, accounts, withdrawals, mpesaSessions } = useFinance();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [paybillBalance, setPaybillBalance] = useState<number>(0);
  const [balanceLastUpdated, setBalanceLastUpdated] = useState<string | null>(null);
  const [balanceSource, setBalanceSource] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  // Modal states
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [newsToEdit, setNewsToEdit] = useState<NewsArticle | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DeletableItem | null>(null);

  // Fetch Paybill balance
  const fetchPaybillBalance = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshingBalance(true);
      }
      const response = await api.mpesa.getBalance(forceRefresh);
      if (response.success && response.data) {
        setPaybillBalance(response.data.balance || 0);
        setBalanceLastUpdated(response.data.last_updated || null);
        setBalanceSource(response.data.source || '');
      }
    } catch (error) {
      console.error('Error fetching paybill balance:', error);
    } finally {
      setRefreshingBalance(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingStats(true);
      await fetchPaybillBalance();
      setIsLoadingStats(false);
    };
    loadInitialData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaybillBalance();
    setRefreshing(false);
  };

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-xl shadow-lg text-center max-w-md border border-border">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">Access Denied</h2>
          <p className="mb-6 text-muted-foreground">You do not have permission to view this page.</p>
          <button
            onClick={() => setRoute({ page: 'home' })}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case 'user':
        deleteUser(itemToDelete.id);
        break;
      case 'project':
        deleteProject(itemToDelete.id);
        break;
      case 'news':
        deleteArticle(itemToDelete.id);
        break;
    }
    setItemToDelete(null);
  };

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => new Date(p.endDate) > new Date()).length;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
    const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const recentTransactions = transactions
      .filter(t => {
        const date = new Date(t.date);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return diff < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAccountBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const successfulMpesa = mpesaSessions.filter(s => s.status === 'successful').length;
    const totalMpesaAmount = mpesaSessions
      .filter(s => s.status === 'successful')
      .reduce((sum, s) => sum + s.amount, 0);

    return {
      totalRevenue,
      totalProjects,
      activeProjects,
      totalUsers,
      activeUsers,
      pendingWithdrawals,
      totalWithdrawn,
      recentTransactions,
      totalAccounts: accounts.length,
      totalAccountBalance,
      recentMpesa: successfulMpesa,
      totalMpesaAmount,
      totalTransactions: transactions.length,
      completedTransactions: completedTransactions.length,
      paybillBalance,
    };
  }, [transactions, projects, users, withdrawals, accounts, mpesaSessions, paybillBalance]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return isLoadingStats ? (
          <OverviewSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Primary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border border-green-500/20 relative">
                <button
                  onClick={() => fetchPaybillBalance(true)}
                  disabled={refreshingBalance}
                  className="absolute top-3 right-3 p-1.5 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh from M-Pesa"
                >
                  <RefreshCw className={`w-4 h-4 text-green-600 ${refreshingBalance ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Paybill Balance</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {refreshingBalance ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `KES ${overviewStats.paybillBalance.toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {balanceLastUpdated ? (
                    <>Live from M-Pesa • {new Date(balanceLastUpdated).toLocaleTimeString()}</>
                  ) : (
                    'Available in M-Pesa'
                  )}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Contributed</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">KES {overviewStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{overviewStats.completedTransactions} transactions</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground">Total Users</div>
                <div className="text-3xl font-bold mt-2">{overviewStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">{overviewStats.activeUsers} active</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground">Active Projects</div>
                <div className="text-3xl font-bold mt-2">{overviewStats.activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">of {overviewStats.totalProjects} total</p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground">Account Balance</div>
                <div className="text-2xl font-bold mt-2">KES {overviewStats.totalAccountBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{overviewStats.totalAccounts} accounts</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground">Total Withdrawn</div>
                <div className="text-2xl font-bold mt-2 text-orange-600">KES {overviewStats.totalWithdrawn.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{overviewStats.pendingWithdrawals} pending</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground">This Week</div>
                <div className="text-2xl font-bold mt-2">KES {overviewStats.recentTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground">M-Pesa Payments</div>
                <div className="text-2xl font-bold mt-2">KES {overviewStats.totalMpesaAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{overviewStats.recentMpesa} successful</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                      <div>
                        <div className="font-medium">{tx.payerName || tx.description || 'Transaction'}</div>
                        <div className="text-sm text-muted-foreground">{tx.reference}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+KES {Number(tx.amount).toLocaleString()}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{tx.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'users':
        return <UserManagement onUserDelete={(user: User) => setItemToDelete({ type: 'user', id: user.id, name: user.name })} />;
      case 'projects':
        return <ProjectManagement onProjectEdit={setProjectToEdit} onProjectDelete={(project: Project) => setItemToDelete({ type: 'project', id: project.id, name: project.title })} />;
      case 'news':
        return <NewsManagement onArticleEdit={setNewsToEdit} onArticleDelete={(article: NewsArticle) => setItemToDelete({ type: 'news', id: article.id, name: article.title })} />;
      case 'finance':
        return <FinanceDashboard />;
      case 'members':
        return <MembersManagement />;
      case 'withdrawals':
        return <WithdrawalManagement />;
      case 'accounts':
        return <AccountManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'tickets':
        return <TicketManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'directory':
        return <MemberDirectory />;
      case 'merchandise':
        return <MerchandiseManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'announcements':
        return <AnnouncementManagement />;
      case 'semesters':
        return <SemesterManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return null;
    }
  };

  const tabs: { id: AdminTab, name: string, icon: React.ReactNode, category?: string }[] = [
    // Main
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, category: 'Main' },
    { id: 'users', name: 'Users', icon: <Users className="w-5 h-5" />, category: 'Main' },
    { id: 'directory', name: 'Members', icon: <Users className="w-5 h-5" />, category: 'Main' },
    // Projects & Content
    { id: 'projects', name: 'Projects', icon: <FilePlus className="w-5 h-5" />, category: 'Content' },
    { id: 'news', name: 'News', icon: <Newspaper className="w-5 h-5" />, category: 'Content' },
    { id: 'announcements', name: 'Announcements', icon: <Megaphone className="w-5 h-5" />, category: 'Content' },
    // Finance
    { id: 'finance', name: 'Finance', icon: <Wallet className="w-5 h-5" />, category: 'Finance' },
    { id: 'accounts', name: 'Accounts', icon: <CreditCard className="w-5 h-5" />, category: 'Finance' },
    { id: 'transactions', name: 'Transactions', icon: <CreditCard className="w-5 h-5" />, category: 'Finance' },
    { id: 'withdrawals', name: 'Withdrawals', icon: <ArrowUpRight className="w-5 h-5" />, category: 'Finance' },
    // Shop
    { id: 'merchandise', name: 'Merchandise', icon: <ShoppingBag className="w-5 h-5" />, category: 'Shop' },
    { id: 'orders', name: 'Orders', icon: <Package className="w-5 h-5" />, category: 'Shop' },
    // Other
    { id: 'tickets', name: 'Tickets', icon: <Ticket className="w-5 h-5" />, category: 'Other' },
    { id: 'semesters', name: 'Semesters', icon: <Calendar className="w-5 h-5" />, category: 'Other' },
    { id: 'reports', name: 'Reports', icon: <TrendingUp className="w-5 h-5" />, category: 'Other' },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" />, category: 'Other' },
  ];

  return (
    <>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed h-full z-10">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">⚡</span> Admin Panel
            </h1>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {['Main', 'Content', 'Finance', 'Shop', 'Other'].map(category => (
              <div key={category}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">{category}</p>
                <div className="space-y-1">
                  {tabs.filter(tab => tab.category === category).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                    >
                      {tab.icon}
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            <button
              onClick={() => setRoute({ page: 'home' })}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={() => setRoute({ page: 'dashboard' })}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              User Dashboard
            </button>
          </div>
        </aside>

        {/* Mobile Header & Sidebar Overlay */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-20 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted-foreground hover:text-foreground">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-10 pt-16" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-card w-72 h-full border-r border-border p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <nav className="space-y-4">
                {['Main', 'Content', 'Finance', 'Shop', 'Other'].map(category => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">{category}</p>
                    <div className="space-y-1">
                      {tabs.filter(tab => tab.category === category).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                        >
                          {tab.icon}
                          {tab.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-border space-y-2">
                  <button
                    onClick={() => setRoute({ page: 'home' })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </button>
                  <button
                    onClick={() => setRoute({ page: 'dashboard' })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    User Dashboard
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto min-h-screen">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <EditProjectModal
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        project={projectToEdit}
      />
      <EditNewsModal
        isOpen={!!newsToEdit}
        onClose={() => setNewsToEdit(null)}
        article={newsToEdit}
      />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

// Overview Dashboard Component
const OverviewDashboard: React.FC<{ stats: any; setActiveTab: (tab: AdminTab) => void }> = ({ stats, setActiveTab }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Platform Overview</h2>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total Revenue"
            value={`KES ${stats.totalRevenue.toLocaleString()}`}
            subtext={`${stats.completedTransactions} transactions`}
            onClick={() => setActiveTab('transactions')}
          />
          <MetricCard
            icon={<Wallet className="w-5 h-5" />}
            label="Account Balance"
            value={`KES ${stats.totalAccountBalance.toLocaleString()}`}
            subtext={`${stats.totalAccounts} accounts`}
            onClick={() => setActiveTab('accounts')}
          />
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Total Users"
            value={stats.totalUsers.toString()}
            subtext={`${stats.activeUsers} active`}
            onClick={() => setActiveTab('users')}
          />
          <MetricCard
            icon={<CreditCard className="w-5 h-5" />}
            label="M-Pesa Payments"
            value={`KES ${stats.totalMpesaAmount.toLocaleString()}`}
            subtext={`${stats.recentMpesa} successful`}
            onClick={() => setActiveTab('finance')}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<FilePlus className="w-5 h-5" />}
            label="Projects"
            value={stats.totalProjects.toString()}
            subtext={`${stats.activeProjects} active`}
            onClick={() => setActiveTab('projects')}
          />
          <MetricCard
            icon={<ArrowUpRight className="w-5 h-5" />}
            label="Withdrawals"
            value={`KES ${stats.totalWithdrawn.toLocaleString()}`}
            subtext={`${stats.pendingWithdrawals} pending`}
            onClick={() => setActiveTab('withdrawals')}
          />
          <MetricCard
            icon={<Ticket className="w-5 h-5" />}
            label="Total Transactions"
            value={stats.totalTransactions.toString()}
            subtext="All time"
            onClick={() => setActiveTab('transactions')}
          />
          <MetricCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="This Week"
            value={`KES ${stats.recentTransactions.toLocaleString()}`}
            subtext="Last 7 days"
            onClick={() => setActiveTab('reports')}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium text-green-600">KES {stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Withdrawn</span>
                <span className="font-medium text-destructive">KES {stats.totalWithdrawn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Account Balance</span>
                <span className="font-medium text-blue-600">KES {stats.totalAccountBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">M-Pesa Total</span>
                <span className="font-medium text-purple-600">KES {stats.totalMpesaAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-foreground font-semibold">Net Balance</span>
                <span className="font-bold text-xl text-primary">
                  KES {(stats.totalRevenue - stats.totalWithdrawn).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('withdrawals')}
                className="w-full bg-secondary/50 hover:bg-secondary text-left px-4 py-3 rounded-lg border border-border transition-colors group"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">Review Pending Withdrawals</span>
                <span className="block text-xs text-muted-foreground mt-1">{stats.pendingWithdrawals} items</span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className="w-full bg-secondary/50 hover:bg-secondary text-left px-4 py-3 rounded-lg border border-border transition-colors group"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">View All Transactions</span>
                <span className="block text-xs text-muted-foreground mt-1">{stats.totalTransactions} total</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full bg-secondary/50 hover:bg-secondary text-left px-4 py-3 rounded-lg border border-border transition-colors group"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">Generate Financial Report</span>
                <span className="block text-xs text-muted-foreground mt-1">Export & Email</span>
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className="w-full bg-secondary/50 hover:bg-secondary text-left px-4 py-3 rounded-lg border border-border transition-colors group"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">Manage Tickets</span>
                <span className="block text-xs text-muted-foreground mt-1">View & Select Winner</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  onClick?: () => void;
}> = ({ icon, label, value, subtext, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl p-6 border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
};

export default AdminPage;
