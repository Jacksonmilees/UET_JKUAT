

import React, { useMemo } from 'react';
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
} from '../components/icons';
import {
  Route,
  Order,
  MpesaSession,
  Account,
  Withdrawal,
  Ticket,
  MandatoryContributionStatus,
  Transaction,
} from '../types';

interface DashboardPageProps {
  setRoute: (route: Route) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const MandatoryContributionCard: React.FC<{
  status: MandatoryContributionStatus;
  onContribute: () => void;
}> = ({ status, onContribute }) => {
  const progress = Math.min(
    100,
    (status.contributedAmount / status.requiredAmount) * 100 || 0
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Mandatory Term Contribution</h3>
        <p className="text-sm text-gray-600">
          Every member pledges{' '}
          <span className="font-semibold text-blue-600">KES {status.requiredAmount}</span>{' '}
          each term to keep the ministry running.
        </p>
        {status.lastContributionDate && (
          <p className="text-xs text-gray-500 mt-2">
            Last fulfilled on{' '}
            {new Date(status.lastContributionDate).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <span>Progress</span>
          <span>
            KES {status.contributedAmount.toLocaleString()} /{' '}
            {status.requiredAmount.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              status.isCleared ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div>
        <button
          onClick={onContribute}
          className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          {status.isCleared ? 'Give Again' : 'Complete Now'}
        </button>
      </div>
    </div>
  );
};

const MpesaSessionTimeline: React.FC<{ sessions: MpesaSession[] }> = ({ sessions }) => {
  if (!sessions.length) {
    return (
      <div className="text-sm text-gray-500">
        No recent M-Pesa requests. Initiate a contribution to see live updates here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.slice(0, 5).map(session => (
        <div
          key={session.id}
          className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {session.projectTitle ?? 'General Contribution'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(session.initiatedAt).toLocaleString()} &bull;{' '}
              {session.phoneNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">
              KES {session.amount.toLocaleString()}
            </p>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1 ${
                session.status === 'successful'
                  ? 'bg-green-100 text-green-700'
                  : session.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-700'
                  : session.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {session.status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const AccountsSnapshot: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  if (!accounts.length) {
    return <p className="text-sm text-gray-500">No ministry accounts assigned to you yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {accounts.slice(0, 4).map(account => (
        <div key={account.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-blue-600 font-semibold">{account.reference}</p>
          <h4 className="text-lg font-bold text-gray-800 mt-1">{account.label}</h4>
          <p className="text-xs text-gray-500">
            Owner: {account.ownerName} · {account.ownerPhone}
          </p>
          <p className="text-sm text-gray-600 mt-3">
            Balance:{' '}
            <span className="font-semibold text-gray-900">
              KES {account.balance.toLocaleString()}
            </span>
          </p>
          <span
            className={`inline-flex items-center mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
              account.status === 'active'
                ? 'bg-green-100 text-green-700'
                : account.status === 'suspended'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {account.status.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
};

const WithdrawalList: React.FC<{ withdrawals: Withdrawal[]; currentUserName?: string }> = ({
  withdrawals,
  currentUserName,
}) => {
  const relevant = withdrawals.filter(withdrawal =>
    currentUserName ? withdrawal.requestedBy === currentUserName : true
  );

  if (!relevant.length) {
    return (
      <p className="text-sm text-gray-500">
        No withdrawal requests recorded under your name yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {relevant.map(withdrawal => (
        <div key={withdrawal.id} className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">
              Withdrawal #{withdrawal.id} · KES {withdrawal.amount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Requested on{' '}
              {new Date(withdrawal.createdAt).toLocaleDateString()} · Account ID{' '}
              {withdrawal.accountId}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              withdrawal.status === 'approved'
                ? 'bg-blue-100 text-blue-700'
                : withdrawal.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : withdrawal.status === 'sent'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {withdrawal.status.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
};

const TicketsSummary: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  if (!tickets.length) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 text-center text-sm text-gray-500">
        No tickets purchased with your phone number yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.slice(0, 4).map(ticket => (
        <div key={ticket.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
          <div>
            <p className="font-semibold text-gray-800">{ticket.ticketNumber}</p>
            <p className="text-xs text-gray-500">
              Purchased on {new Date(ticket.purchaseDate).toLocaleDateString()} · Expires{' '}
              {new Date(ticket.expiryDate).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              ticket.status === 'active'
                ? 'bg-green-100 text-green-700'
                : ticket.status === 'expired'
                ? 'bg-gray-200 text-gray-600'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {ticket.status.toUpperCase()}
          </span>
        </div>
      ))}
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
    mpesaSessions,
    accounts,
    withdrawals,
    tickets,
  } = useFinance();

  const userTransactions = useMemo<Transaction[]>(
    () => getUserTransactions(user?.id),
    [getUserTransactions, user?.id]
  );

  const userDonations = useMemo(
    () =>
      getUserDonations(user?.id).filter(donation => donation.status === 'completed'),
    [getUserDonations, user?.id]
  );

  const userStats = useMemo(() => {
    const totalContributed = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const projectsSupported = new Set(userDonations.map(donation => donation.projectId)).size;
    return { totalContributed, projectsSupported };
  }, [userDonations]);

  const mandatoryStatus = useMemo(
    () => getMandatoryStatus(user?.id),
    [getMandatoryStatus, user?.id]
  );

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-6">Please log in to view your dashboard.</p>
        <button onClick={() => setRoute({ page: 'login' })} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Login
        </button>
      </div>
    );
  }
  
  const userOrders = orders.filter(o => o.userId === user.id);
  const myAccounts = accounts.filter(account => account.ownerPhone === user.phoneNumber);
  const myWithdrawals = withdrawals.filter(
    withdrawal => withdrawal.requestedBy === user.name
  );
  const myTickets = tickets.filter(ticket => ticket.phoneNumber === user.phoneNumber);

  return (
    <div className="bg-gray-100 min-h-full">
      <div className="container mx-auto px-6 py-12">
        <header className="mb-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome, {user.name}!</h1>
            <p className="text-lg text-gray-600">Here's a summary of your activity on the platform.</p>
        </header>

        <div className="mb-10">
          <MandatoryContributionCard
            status={mandatoryStatus}
            onContribute={() => setRoute({ page: 'home' })}
          />
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard 
                icon={<IconTrendingUp className="w-6 h-6"/>}
                label="Total Contributed" 
                value={`KES ${userStats.totalContributed.toLocaleString()}`}
            />
            <StatCard 
                icon={<IconTarget className="w-6 h-6"/>}
                label="Projects Supported" 
                value={userStats.projectsSupported.toString()}
            />
            <StatCard 
                icon={<IconUsers className="w-6 h-6"/>}
                label="Contributions Made" 
                value={userTransactions.length.toString()}
            />
        </div>
        
        <div className="space-y-12">
            {/* Recent Transactions */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Contribution History</h2>
                {userTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Project</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Reference</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {userTransactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{tx.projectTitle}</td>
                                        <td className="p-4 text-gray-700">KES {tx.amount.toLocaleString()}</td>
                                        <td className="p-4 text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-500 capitalize">{tx.status}</td>
                                        <td className="p-4 text-gray-500 font-mono text-xs">{tx.reference ?? '—'}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => setRoute({ page: 'projectDetail', params: { id: tx.projectId } })}
                                                className="text-blue-600 hover:underline font-semibold"
                                            >
                                                View Project
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-4">You haven't made any contributions yet.</p>
                        <button onClick={() => setRoute({ page: 'home' })} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
                            Explore Projects
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <IconPhone className="w-5 h-5 text-blue-500" /> M-Pesa Activity
                </h2>
                <MpesaSessionTimeline sessions={mpesaSessions} />
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <IconHash className="w-5 h-5 text-blue-500" /> Ministry Accounts
                </h2>
                <AccountsSnapshot accounts={myAccounts.length ? myAccounts : accounts.slice(0, 2)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <IconCalendar className="w-5 h-5 text-blue-500" /> Withdrawal Requests
                </h2>
                <WithdrawalList withdrawals={myWithdrawals.length ? myWithdrawals : withdrawals} currentUserName={user.name} />
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <IconTarget className="w-5 h-5 text-blue-500" /> Tickets Linked to You
                </h2>
                <TicketsSummary tickets={myTickets} />
              </div>
            </div>

             {/* Order History */}
             <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Order History</h2>
                {userOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Order ID</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Total</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userOrders.map((order: Order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-mono text-xs text-gray-600">#{order.id.split('-')[0]}</td>
                                        <td className="p-4 text-gray-700">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-700">KES {order.totalAmount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-4">You haven't purchased any merchandise yet.</p>
                        <button onClick={() => setRoute({ page: 'merch' })} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
                            Browse Merch
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;