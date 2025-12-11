import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { useNews } from '../contexts/NewsContext';
import { useFinance } from '../contexts/FinanceContext';
import UserManagement from '../components/admin/UserManagement';
import ProjectManagement from '../components/admin/ProjectManagement';
import { NewsManagement } from '../components/admin/NewsManagement';
import FinanceDashboard from '../components/admin/FinanceDashboard';
import MembersManagement from '../components/admin/MembersManagement';
import EditProjectModal from '../components/admin/EditProjectModal';
import EditNewsModal from '../components/admin/EditNewsModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Route, Project, NewsArticle, User } from '../types';
import { 
  IconFilePlus, 
  IconNewspaper, 
  IconUserShield, 
  IconTrendingUp,
  IconUsers,
  IconTarget,
  IconCreditCard,
  IconAlertCircle,
  IconCheckCircle,
  IconClock,
  IconWallet
} from '../components/icons';

interface AdminPageProps {
  setRoute: (route: Route) => void;
}

type AdminTab = 'overview' | 'users' | 'projects' | 'news' | 'finance' | 'members';
type DeletableItem = { type: 'user' | 'project' | 'news', id: number, name: string };

const AdminPage: React.FC<AdminPageProps> = ({ setRoute }) => {
  const { user, users, deleteUser } = useAuth();
  const { projects, deleteProject } = useProjects();
  const { articles, deleteArticle } = useNews();
  const { transactions, accounts, withdrawals, mpesaSessions } = useFinance();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Modal states
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [newsToEdit, setNewsToEdit] = useState<NewsArticle | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DeletableItem | null>(null);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
          <IconAlertCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Access Denied</h2>
          <p className="mb-8 text-gray-600">You do not have permission to view this page.</p>
          <button 
            onClick={() => setRoute({ page: 'home' })} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
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
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => new Date(p.endDate) > new Date()).length;
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    
    const recentTransactions = transactions
      .filter(t => {
        const date = new Date(t.date);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return diff < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      totalProjects,
      activeProjects,
      totalUsers,
      activeUsers,
      pendingWithdrawals,
      recentTransactions,
      totalAccounts: accounts.length,
      recentMpesa: mpesaSessions.filter(s => s.status === 'successful').length,
    };
  }, [transactions, projects, users, withdrawals, accounts, mpesaSessions]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard stats={overviewStats} />;
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
      default:
        return null;
    }
  };

  const tabs: { id: AdminTab, name: string, icon: React.ReactNode, color: string }[] = [
    { id: 'overview', name: 'Overview', icon: <IconLayoutDashboard className="w-5 h-5" />, color: 'blue' },
    { id: 'users', name: 'Users', icon: <IconUserShield className="w-5 h-5" />, color: 'green' },
    { id: 'projects', name: 'Projects', icon: <IconFilePlus className="w-5 h-5" />, color: 'purple' },
    { id: 'news', name: 'News', icon: <IconNewspaper className="w-5 h-5" />, color: 'orange' },
    { id: 'finance', name: 'Finance', icon: <IconWallet className="w-5 h-5" />, color: 'indigo' },
    { id: 'members', name: 'Members', icon: <IconUsers className="w-5 h-5" />, color: 'pink' },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  Admin Dashboard 🎯
                </h1>
                <p className="text-lg text-gray-600">Manage your platform, users, and content</p>
              </div>
              <button
                onClick={() => setRoute({ page: 'dashboard' })}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
              >
                ← Back to User Dashboard
              </button>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all transform ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg scale-105`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
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
const OverviewDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Platform Overview</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<IconTrendingUp className="w-8 h-8" />}
            label="Total Revenue"
            value={`KES ${stats.totalRevenue.toLocaleString()}`}
            subtext={`+KES ${stats.recentTransactions.toLocaleString()} this week`}
            color="green"
          />
          <MetricCard
            icon={<IconUsers className="w-8 h-8" />}
            label="Total Users"
            value={stats.totalUsers.toString()}
            subtext={`${stats.activeUsers} active`}
            color="blue"
          />
          <MetricCard
            icon={<IconTarget className="w-8 h-8" />}
            label="Projects"
            value={stats.totalProjects.toString()}
            subtext={`${stats.activeProjects} active`}
            color="purple"
          />
          <MetricCard
            icon={<IconCreditCard className="w-8 h-8" />}
            label="Pending Withdrawals"
            value={stats.pendingWithdrawals.toString()}
            subtext="Requires attention"
            color="orange"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IconWallet className="w-6 h-6 text-blue-600" />
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Accounts</span>
                <span className="font-bold text-gray-800">{stats.totalAccounts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Successful M-Pesa</span>
                <span className="font-bold text-gray-800">{stats.recentMpesa}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Week Revenue</span>
                <span className="font-bold text-green-600">KES {stats.recentTransactions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IconCheckCircle className="w-6 h-6 text-purple-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-white hover:bg-gray-50 text-left px-4 py-3 rounded-lg border border-gray-200 transition-all">
                <span className="font-semibold text-gray-800">Review Pending Withdrawals</span>
                <span className="block text-sm text-gray-500">{stats.pendingWithdrawals} items</span>
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-left px-4 py-3 rounded-lg border border-gray-200 transition-all">
                <span className="font-semibold text-gray-800">View Recent Transactions</span>
                <span className="block text-sm text-gray-500">Last 7 days</span>
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-left px-4 py-3 rounded-lg border border-gray-200 transition-all">
                <span className="font-semibold text-gray-800">Manage Active Projects</span>
                <span className="block text-sm text-gray-500">{stats.activeProjects} active</span>
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
  color: 'green' | 'blue' | 'purple' | 'orange';
}> = ({ icon, label, value, subtext, color }) => {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
      <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg inline-block mb-4`}>
        {icon}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-gray-800 mb-2">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  );
};

// Add missing icon
const IconLayoutDashboard: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/>
    <rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/>
    <rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

export default AdminPage;
