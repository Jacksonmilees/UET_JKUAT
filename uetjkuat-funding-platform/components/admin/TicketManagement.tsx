import React, { useState, useEffect } from 'react';
import { Hash, TrendingUp, Users, Target, Trophy, X } from 'lucide-react';
import api from '../../services/api';

interface Ticket {
  id: number;
  ticket_number: string;
  mmid: string;
  buyer_name: string;
  buyer_contact: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'winner';
  payment_status: string;
  created_at: string;
  member?: {
    name: string;
    whatsapp: string;
  };
}

const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'winner'>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.tickets.getAllCompleted();
      if (response.success && response.data) {
        const ticketData = response.data.tickets || response.data;
        setTickets(Array.isArray(ticketData) ? ticketData : []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = async () => {
    try {
      setLoading(true);
      const response = await api.tickets.selectWinner();
      if (response.success && response.data) {
        setWinner(response.data.winner);
        setShowWinnerModal(true);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error selecting winner:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'completed' || t.status === 'winner').length;
  const totalRevenue = tickets
    .filter(t => t.status === 'completed' || t.status === 'winner')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get top sellers
  const sellerStats = tickets.reduce((acc, ticket) => {
    if (ticket.status === 'completed' || ticket.status === 'winner') {
      if (!acc[ticket.mmid]) {
        acc[ticket.mmid] = {
          mmid: ticket.mmid,
          name: ticket.member?.name || 'Unknown',
          count: 0,
          revenue: 0,
        };
      }
      acc[ticket.mmid].count++;
      acc[ticket.mmid].revenue += ticket.amount;
    }
    return acc;
  }, {} as Record<string, { mmid: string; name: string; count: number; revenue: number }>);

  const topSellers = Object.values(sellerStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Hash className="w-6 h-6 text-primary" />
            Ticket Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage ticket sales and select winners</p>
        </div>
        <button
          onClick={handleSelectWinner}
          disabled={completedTickets === 0}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Select Winner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Tickets</p>
            <Hash className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalTickets}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
            <Target className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{completedTickets}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">KES {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Sellers</p>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{topSellers.length}</p>
        </div>
      </div>

      {/* Top Sellers Leaderboard */}
      {topSellers.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Sellers Leaderboard
          </h3>
          <div className="space-y-3">
            {topSellers.map((seller, index) => (
              <div
                key={seller.mmid}
                className={`flex items-center justify-between p-4 rounded-xl border ${index === 0
                    ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800'
                    : index === 1
                      ? 'bg-slate-50/50 border-slate-200 dark:bg-slate-900/10 dark:border-slate-800'
                      : index === 2
                        ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800'
                        : 'bg-card border-border'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                      ? 'bg-yellow-500 text-white'
                      : index === 1
                        ? 'bg-slate-400 text-white'
                        : index === 2
                          ? 'bg-orange-500 text-white'
                          : 'bg-secondary text-muted-foreground'
                    }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">MMID: {seller.mmid}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{seller.count} tickets</p>
                  <p className="text-xs text-muted-foreground">KES {seller.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-card rounded-xl shadow-sm p-1 border border-border inline-flex w-full md:w-auto overflow-x-auto">
        {(['all', 'completed', 'pending', 'winner'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === status
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <Hash className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No tickets found</p>
          <p className="text-muted-foreground mt-2">No tickets match the selected filter</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket Number</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Seller (MMID)</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className={`hover:bg-secondary/30 transition-colors ${ticket.status === 'winner' ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''
                    }`}>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-primary">
                        {ticket.ticket_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{ticket.buyer_name}</div>
                      <div className="text-xs text-muted-foreground">{ticket.buyer_contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {ticket.member?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">{ticket.mmid}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-green-600">
                        KES {ticket.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : ticket.status === 'winner'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : ticket.status === 'pending'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {ticket.status === 'winner' ? '🏆 WINNER' : ticket.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full p-8 text-center border border-border relative">
            <button
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Congratulations!</h2>

            <div className="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl p-8 mb-6 border-2 border-yellow-400/50">
              <p className="text-lg text-muted-foreground mb-2">Winning Ticket</p>
              <p className="text-4xl font-bold text-primary mb-4 font-mono">{winner.ticket_number}</p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Winner</p>
                  <p className="text-lg font-bold text-foreground">{winner.buyer_name}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Contact</p>
                  <p className="text-lg font-bold text-foreground">{winner.buyer_contact}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Amount</p>
                  <p className="text-lg font-bold text-green-600">KES {winner.amount.toLocaleString()}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Sold By</p>
                  <p className="text-lg font-bold text-foreground">{winner.member?.name || winner.mmid}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWinnerModal(false)}
              className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold hover:bg-primary/90 shadow-lg transform hover:scale-[1.02] transition-all text-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
