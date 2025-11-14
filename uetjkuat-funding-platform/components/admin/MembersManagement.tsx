import React, { useEffect, useState } from 'react';
import api from '../../services/api';

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
      const res = await api.users.toggleStatus(id);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Members</h2>
          <p className="text-sm text-gray-600">Manage member list, roles, status, and bible study groups.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search member..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={load}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Bible Study Group</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.phone_number || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{m.role || 'user'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {m.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <input
                    defaultValue={m.bible_study_group || ''}
                    onBlur={(e) => updateMember(m.id, { bible_study_group: e.target.value })}
                    placeholder="e.g., Alpha Group"
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-44"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRole(m.id)}
                      className="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                      title="Toggle Role"
                    >
                      Toggle Role
                    </button>
                    <button
                      onClick={() => toggleStatus(m.id)}
                      className="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                      title="Toggle Status"
                    >
                      Toggle Status
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={7}>
                  {error || 'No members found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersManagement;





