import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { ApiResponse } from '../../types/backend';
import {
  Ticket, Trophy, DollarSign, Users, CheckCircle, Clock, X, Eye
} from 'lucide-react';
import api from '../../services/api';

interface TicketSale {
  id: number;
  ticket_number: string;
  member_id: string;
  phone_number: string;
  amount: string | number;
  payment_status: 'pending' | 'completed' | 'failed';
  mpesa_receipt?: string;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
}

export function TicketsManagement({ className = '' }: { className?: string }) {
  const [tickets, setTickets] = useState<TicketSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketSale['payment_status']>('all');
  const [winnerFilter, setWinnerFilter] = useState<'all' | 'winners' | 'non-winners'>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketSale | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<TicketSale[]> = await api.tickets.getAll();
      if (response.success && response.data) {
        setTickets(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTicketDetails = (ticket: TicketSale) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.ticket_number.toLowerCase().includes(query) ||
        ticket.member_id.toLowerCase().includes(query) ||
        ticket.phone_number.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.payment_status === statusFilter);
    }

    if (winnerFilter === 'winners') {
      filtered = filtered.filter(ticket => ticket.is_winner);
    } else if (winnerFilter === 'non-winners') {
      filtered = filtered.filter(ticket => !ticket.is_winner);
    }

    return filtered;
  }, [tickets, searchQuery, statusFilter, winnerFilter]);

  const stats = {
    total: tickets.length,
    sold: tickets.filter(t => t.payment_status === 'completed').length,
    pending: tickets.filter(t => t.payment_status === 'pending').length,
    winners: tickets.filter(t => t.is_winner).length,
    revenue: tickets
      .filter(t => t.payment_status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
  };

  const columns = [
    {
      key: 'ticket_number',
      header: 'Ticket #',
      render: (ticket: TicketSale) => (
        <div className="font-mono font-medium text-gray-900">{ticket.ticket_number}</div>
      )
    },
    {
      key: 'member',
      header: 'Member',
      render: (ticket: TicketSale) => (
        <div>
          <div className="font-medium text-gray-900">{ticket.member_id}</div>
          <div className="text-sm text-gray-500">{ticket.phone_number}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (ticket: TicketSale) => (
        <div className="font-medium text-gray-900">
          KES {parseFloat(ticket.amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (ticket: TicketSale) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          completed: 'bg-green-100 text-green-800',
          failed: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[ticket.payment_status]}`}>
            {ticket.payment_status.charAt(0).toUpperCase() + ticket.payment_status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'winner',
      header: 'Winner',
      render: (ticket: TicketSale) => ticket.is_winner ? (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 inline-flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          Winner
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'date',
      header: 'Purchase Date',
      render: (ticket: TicketSale) => new Date(ticket.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (ticket: TicketSale) => (
        <button
          onClick={() => openTicketDetails(ticket)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track event ticket sales and winners</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Tickets" value={stats.total.toString()} icon={Ticket} gradient="blue" loading={loading} />
        <StatCard title="Sold" value={stats.sold.toString()} icon={CheckCircle} gradient="green" loading={loading} />
        <StatCard title="Pending" value={stats.pending.toString()} icon={Clock} gradient="orange" loading={loading} />
        <StatCard title="Winners" value={stats.winners.toString()} icon={Trophy} gradient="purple" loading={loading} />
        <StatCard title="Total Revenue" value={`KES ${stats.revenue.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`} icon={DollarSign} gradient="green" loading={loading} />
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tickets..."
        filters={[
          {
            label: 'Payment Status',
            value: statusFilter,
            onChange: (value) => setStatusFilter(value as typeof statusFilter),
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
            ],
          },
          {
            label: 'Winners',
            value: winnerFilter,
            onChange: (value) => setWinnerFilter(value as typeof winnerFilter),
            options: [
              { value: 'all', label: 'All Tickets' },
              { value: 'winners', label: 'Winners Only' },
              { value: 'non-winners', label: 'Non-Winners' },
            ],
          },
        ]}
        onRefresh={fetchTickets}
      />

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredTickets}
          columns={columns}
          keyExtractor={(ticket) => ticket.id.toString()}
          loading={loading}
          emptyMessage="No tickets found"
          itemsPerPage={15}
        />
      </div>

      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-900">Ticket Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedTicket.is_winner && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">Winner!</div>
                    <div className="text-sm text-purple-700">This ticket is a winning ticket</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Ticket Number:</span>
                  <p className="font-mono font-medium text-gray-900">{selectedTicket.ticket_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Member ID:</span>
                  <p className="font-medium text-gray-900">{selectedTicket.member_id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone Number:</span>
                  <p className="font-medium text-gray-900">{selectedTicket.phone_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Amount:</span>
                  <p className="font-medium text-green-600">
                    KES {parseFloat(selectedTicket.amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Status:</span>
                  <p className="font-medium text-gray-900">{selectedTicket.payment_status}</p>
                </div>
                {selectedTicket.mpesa_receipt && (
                  <div>
                    <span className="text-sm text-gray-500">M-Pesa Receipt:</span>
                    <p className="font-mono text-sm text-gray-900">{selectedTicket.mpesa_receipt}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Purchase Date:</span>
                  <p className="font-medium text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
