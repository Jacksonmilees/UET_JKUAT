import React, { useState, useEffect } from 'react';
import { Users, Wallet, Hash, Phone, Search, X } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Member Directory
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage members and their wallets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Members</p>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Members</p>
            <Hash className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Wallets</p>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">KES {totalWalletBalance.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tickets Sold</p>
            <Hash className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{totalTicketsSold}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl shadow-sm p-4 border border-border">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search by name or MMID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No members found</p>
          <p className="text-muted-foreground mt-2">Try a different search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-border cursor-pointer group"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                  <p className="text-sm text-primary font-mono font-bold">MMID: {member.mmid}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-secondary text-muted-foreground'
                  }`}>
                  {member.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{member.whatsapp}</span>
                </div>

                <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Wallet Balance</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    KES {(member.wallet_balance || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Tickets Sold</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {member.total_tickets_sold || 0}
                  </p>
                </div>
              </div>

              <button className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-border relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground mb-6">Member Profile</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                  <p className="text-lg font-bold text-foreground">{selectedMember.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">MMID</p>
                  <p className="text-lg font-bold text-primary font-mono">{selectedMember.mmid}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">WhatsApp</p>
                  <p className="font-semibold text-foreground">{selectedMember.whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedMember.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-secondary text-muted-foreground'
                    }`}>
                    {selectedMember.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Wallet Balance</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KES {(selectedMember.wallet_balance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Tickets Sold</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedMember.total_tickets_sold || 0}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                <p className="font-semibold text-foreground">
                  {new Date(selectedMember.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
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
