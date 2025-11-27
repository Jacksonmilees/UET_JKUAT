import React, { useState, useEffect } from 'react';
import { IconHash, IconTrendingUp, IconUsers, IconTarget } from '../icons';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <IconHash className="w-8 h-8 text-purple-600" />
            Ticket Management
          </h2>
          <p className="text-gray-600 mt-1">Manage ticket sales and select winners</p>
        </div>
        <button
          onClick={handleSelectWinner}
          disabled={completedTickets === 0}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
        >
          🎲 Select Winner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-semibold mb-2">Total Tickets</p>
              <p className="text-4xl font-extrabold text-purple-800">{totalTickets}</p>
            </div>
            <div className="p-4 bg-purple-600 rounded-xl">
              <IconHash className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold mb-2">Completed</p>
              <p className="text-4xl font-extrabold text-green-800">{completedTickets}</p>
            </div>
            <div className="p-4 bg-green-600 rounded-xl">
              <IconTarget className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-semibold mb-2">Total Revenue</p>
              <p className="text-3xl font-extrabold text-blue-800">KES {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-600 rounded-xl">
              <IconTrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 font-semibold mb-2">Top Sellers</p>
              <p className="text-4xl font-extrabold text-orange-800">{topSellers.length}</p>
            </div>
            <div className="p-4 bg-orange-600 rounded-xl">
              <IconUsers className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Sellers Leaderboard */}
      {topSellers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏆 Top Sellers Leaderboard
          </h3>
          <div className="space-y-3">
            {topSellers.map((seller, index) => (
              <div
                key={seller.mmid}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-400'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    index === 0
                      ? 'bg-yellow-500 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{seller.name}</p>
                    <p className="text-sm text-gray-600">MMID: {seller.mmid}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-purple-600">{seller.count} tickets</p>
                  <p className="text-sm text-gray-600">KES {seller.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
        {(['all', 'completed', 'pending', 'winner'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconHash className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No tickets found</p>
          <p className="text-gray-500 mt-2">No tickets match the selected filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Ticket Number</th>
                  <th className="px-6 py-4 text-left font-bold">Buyer</th>
                  <th className="px-6 py-4 text-left font-bold">Seller (MMID)</th>
                  <th className="px-6 py-4 text-right font-bold">Amount</th>
                  <th className="px-6 py-4 text-center font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className={`hover:bg-purple-50 transition-colors ${
                    ticket.status === 'winner' ? 'bg-yellow-50' : ''
                  }`}>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-purple-600">
                        {ticket.ticket_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{ticket.buyer_name}</div>
                      <div className="text-sm text-gray-500">{ticket.buyer_contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {ticket.member?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">{ticket.mmid}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-green-600">
                        KES {ticket.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : ticket.status === 'winner'
                          ? 'bg-yellow-100 text-yellow-700'
                          : ticket.status === 'pending'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {ticket.status === 'winner' ? '🏆 WINNER' : ticket.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Congratulations!</h2>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 mb-6 border-4 border-yellow-400">
              <p className="text-lg text-gray-700 mb-2">Winning Ticket</p>
              <p className="text-4xl font-bold text-purple-600 mb-4 font-mono">{winner.ticket_number}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Winner</p>
                  <p className="text-xl font-bold text-gray-800">{winner.buyer_name}</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <p className="text-xl font-bold text-gray-800">{winner.buyer_contact}</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="text-xl font-bold text-green-600">KES {winner.amount.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Sold By</p>
                  <p className="text-xl font-bold text-gray-800">{winner.member?.name || winner.mmid}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWinnerModal(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all text-lg"
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
