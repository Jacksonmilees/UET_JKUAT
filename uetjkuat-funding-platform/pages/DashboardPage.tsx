import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFinance } from '../contexts/FinanceContext';
import {
  IconTarget,
  IconTrendingUp,
  IconUsers,
  IconCalendar,
  IconHash,
  IconPhone,
  IconCreditCard,
  IconWallet,
  IconArrowUp,
  IconArrowDown,
  IconCheckCircle,
  IconClock,
  IconAlertCircle,
} from '../components/icons';
import { Route, Transaction } from '../types';

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
  } = useFinance();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const userTransactions = useMemo<Transaction[]>(
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
          <IconAlertCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Access Denied</h2>
          <p className="mb-8 text-gray-600">Please log in to view your dashboard.</p>
          <button 
            onClick={() => setRoute({ page: 'login' })} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  const myAccounts = accounts.filter(account => account.ownerPhone === user.phoneNumber);
  const myWithdrawals = withdrawals.filter(withdrawal => withdrawal.requestedBy === user.name);
  const myTickets = tickets.filter(ticket => ticket.phoneNumber === user.phoneNumber);
  const userOrders = orders.filter(o => o.userId === user.id);

  const progress = Math.min(100, (mandatoryStatus.contributedAmount / mandatoryStatus.requiredAmount) * 100 || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-lg text-gray-600">Here's what's happening with your account today.</p>
            </div>
            {user.role === 'admin' && (
              <button
                onClick={() => setRoute({ page: 'admin' })}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <IconUserShield className="w-5 h-5" />
                Admin Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Mandatory Contribution Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <IconWallet className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Mandatory Term Contribution</h3>
                </div>
                <p className="text-blue-100 mb-4">
                  Every member pledges <span className="font-bold text-white">KES {mandatoryStatus.requiredAmount}</span> each term to keep the ministry running.
                </p>
                {mandatoryStatus.lastContributionDate && (
                  <p className="text-sm text-blue-200">
                    Last fulfilled on {new Date(mandatoryStatus.lastContributionDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="lg:w-1/3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold">
                      KES {mandatoryStatus.contributedAmount.toLocaleString()} / {mandatoryStatus.requiredAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${mandatoryStatus.isCleared ? 'bg-green-400' : 'bg-yellow-400'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => setRoute({ page: 'home' })}
                    className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg"
                  >
                    {mandatoryStatus.isCleared ? '✓ Completed - Give Again' : 'Complete Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<IconTrendingUp className="w-8 h-8" />}
            label="Total Contributed"
            value={`KES ${userStats.totalContributed.toLocaleString()}`}
            trend="+12%"
            trendUp={true}
            color="blue"
          />
          <StatCard
            icon={<IconTarget className="w-8 h-8" />}
            label="Projects Supported"
            value={userStats.projectsSupported.toString()}
            trend="+3"
            trendUp={true}
            color="green"
          />
          <StatCard
            icon={<IconUsers className="w-8 h-8" />}
            label="This Month"
            value={userStats.recentContributions.toString()}
            trend="Active"
            color="purple"
          />
          <StatCard
            icon={<IconCreditCard className="w-8 h-8" />}
            label="Total Transactions"
            value={userTransactions.length.toString()}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <IconClock className="w-6 h-6 text-blue-600" />
                  Recent Contributions
                </h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              {userTransactions.length > 0 ? (
                <div className="space-y-4">
                  {userTransactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${tx.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                          {tx.status === 'completed' ? (
                            <IconCheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <IconClock className="w-6 h-6 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{tx.projectTitle}</p>
                          <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">KES {tx.amount.toLocaleString()}</p>
                        <button
                          onClick={() => setRoute({ page: 'projectDetail', params: { id: tx.projectId } })}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <IconTarget className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-6 text-lg">No contributions yet</p>
                  <button
                    onClick={() => setRoute({ page: 'home' })}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
                  >
                    Explore Projects
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* M-Pesa Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <IconPhone className="w-6 h-6 text-green-600" />
              M-Pesa Activity
            </h2>
            {mpesaSessions.length > 0 ? (
              <div className="space-y-4">
                {mpesaSessions.slice(0, 5).map(session => (
                  <div key={session.id} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-semibold text-gray-800">{session.projectTitle ?? 'General'}</p>
                    <p className="text-sm text-gray-500">{new Date(session.initiatedAt).toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gray-800">KES {session.amount.toLocaleString()}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        session.status === 'successful' ? 'bg-green-100 text-green-700' :
                        session.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <IconPhone className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm">No M-Pesa activity yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tickets */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <IconHash className="w-6 h-6 text-purple-600" />
              My Tickets
            </h2>
            {myTickets.length > 0 ? (
              <div className="space-y-4">
                {myTickets.slice(0, 4).map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div>
                      <p className="font-bold text-gray-800">{ticket.ticketNumber}</p>
                      <p className="text-sm text-gray-500">
                        Expires {new Date(ticket.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">No tickets purchased yet</p>
              </div>
            )}
          </div>

          {/* Withdrawals */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <IconCalendar className="w-6 h-6 text-orange-600" />
              Withdrawal Requests
            </h2>
            {myWithdrawals.length > 0 ? (
              <div className="space-y-4">
                {myWithdrawals.map(withdrawal => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <div>
                      <p className="font-bold text-gray-800">KES {withdrawal.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      withdrawal.status === 'sent' ? 'bg-green-100 text-green-700' :
                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {withdrawal.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">No withdrawal requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ icon, label, value, trend, trendUp, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-gray-800">{value}</p>
    </div>
  );
};

// Add missing icon component
const IconUserShield: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default DashboardPage;
