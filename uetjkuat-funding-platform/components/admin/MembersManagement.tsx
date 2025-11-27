import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, RefreshCw, UserCog, UserX, UserCheck, Shield, Phone, Mail } from 'lucide-react';

type Member = {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  role?: string;
  status?: string;
  bible_study_group?: string;
};

const MembersManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.users.getAll();
      if (res.success && Array.isArray(res.data)) {
        setMembers(res.data as any);
      } else {
        setError(res.error || 'Failed to load members');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = members.filter(m =>
    [m.name, m.email, m.phone_number, m.bible_study_group]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const updateMember = async (id: number, patch: Partial<Member>) => {
    try {
      const res = await api.users.update(id, patch);
      if (res.success) {
        setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
      } else {
        alert(res.error || 'Update failed');
      }
    } catch (e: any) {
      alert(e.message || 'Update failed');
    }
  };

  const toggleRole = async (id: number) => {
    try {
      const res = await api.users.toggleRole(id);
      if (res.success) {
        await load();
      } else {
        alert(res.error || 'Failed to toggle role');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to toggle role');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const res = await api.users.toggleStatus(String(id));
      if (res.success) {
        await load();
      } else {
        alert(res.error || 'Failed to toggle status');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Members</h2>
          <p className="text-sm text-muted-foreground">Manage member list, roles, status, and bible study groups.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search member..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
            />
          </div>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bible Study Group</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" /> {m.email}
                      </div>
                      {m.phone_number && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" /> {m.phone_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${m.role === 'admin' || m.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-secondary text-secondary-foreground'
                      }`}>
                      {m.role === 'admin' || m.role === 'super_admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                      {m.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${m.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                      {m.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      defaultValue={m.bible_study_group || ''}
                      onBlur={(e) => updateMember(m.id, { bible_study_group: e.target.value })}
                      placeholder="e.g., Alpha Group"
                      className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-sm py-1 transition-colors text-foreground placeholder:text-muted-foreground/50"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleRole(m.id)}
                        className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Toggle Role"
                      >
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(m.id)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title="Toggle Status"
                      >
                        {m.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="px-6 py-12 text-center text-muted-foreground" colSpan={6}>
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>{error || 'No members found matching your search.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersManagement;





