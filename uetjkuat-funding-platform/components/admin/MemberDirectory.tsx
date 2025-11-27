import React, { useState, useEffect } from 'react';
import { IconUsers, IconWallet, IconHash, IconPhone } from '../icons';
import api from '../../services/api';

interface Member {
  id: number;
  mmid: string;
  name: string;
  whatsapp: string;
  wallet_balance: number;
  total_tickets_sold: number;
  status: 'active' | 'inactive';
  created_at: string;
}

const MemberDirectory: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.members.getAll();
      if (response.success && response.data) {
        setMembers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMembers();
      return;
    }

    try {
      setLoading(true);
      const response = await api.members.search(searchQuery);
      if (response.success && response.data) {
        setMembers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const totalWalletBalance = members.reduce((sum, m) => sum + (m.wallet_balance || 0), 0);
  const totalTicketsSold = members.reduce((sum, m) => sum + (m.total_tickets_sold || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconUsers className="w-8 h-8 text-indigo-600" />
          Member Directory
        </h2>
        <p className="text-gray-600 mt-1">Manage members and their wallets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-700 font-semibold mb-2">Total Members</p>
              <p className="text-4xl font-extrabold text-indigo-800">{totalMembers}</p>
            </div>
            <div className="p-4 bg-indigo-600 rounded-xl">
              <IconUsers className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold mb-2">Active Members</p>
              <p className="text-4xl font-extrabold text-green-800">{activeMembers}</p>
            </div>
            <div className="p-4 bg-green-600 rounded-xl">
              <IconHash className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-semibold mb-2">Total Wallets</p>
              <p className="text-3xl font-extrabold text-blue-800">KES {totalWalletBalance.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-600 rounded-xl">
              <IconWallet className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-semibold mb-2">Tickets Sold</p>
              <p className="text-4xl font-extrabold text-purple-800">{totalTicketsSold}</p>
            </div>
            <div className="p-4 bg-purple-600 rounded-xl">
              <IconHash className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name or MMID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          />
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconUsers className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No members found</p>
          <p className="text-gray-500 mt-2">Try a different search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-200 cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-sm text-indigo-600 font-mono font-bold">MMID: {member.mmid}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {member.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <IconPhone className="w-4 h-4" />
                  <span className="text-sm">{member.whatsapp}</span>
                </div>

                <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
                  <p className="text-xs text-green-700 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-extrabold text-green-600">
                    KES {(member.wallet_balance || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200">
                  <p className="text-xs text-purple-700 mb-1">Tickets Sold</p>
                  <p className="text-2xl font-extrabold text-purple-600">
                    {member.total_tickets_sold || 0}
                  </p>
                </div>
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Member Profile</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-xl font-bold text-gray-800">{selectedMember.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">MMID</p>
                  <p className="text-xl font-bold text-indigo-600 font-mono">{selectedMember.mmid}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">WhatsApp</p>
                  <p className="font-semibold text-gray-800">{selectedMember.whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedMember.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedMember.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm text-green-700 mb-2">Wallet Balance</p>
                  <p className="text-3xl font-extrabold text-green-600">
                    KES {(selectedMember.wallet_balance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm text-purple-700 mb-2">Tickets Sold</p>
                  <p className="text-3xl font-extrabold text-purple-600">
                    {selectedMember.total_tickets_sold || 0}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedMember.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all">
                  Edit Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
