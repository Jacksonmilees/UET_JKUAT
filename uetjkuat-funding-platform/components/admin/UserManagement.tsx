
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Trash2, Shield, UserCheck, UserX } from 'lucide-react';

interface UserManagementProps {
    onUserDelete: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserDelete }) => {
    const { users, toggleUserStatus, toggleUserRole, user: adminUser } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <div className="text-sm text-muted-foreground">
                    Total Users: {users.length}
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user: User) => (
                                <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover border border-border"
                                            />
                                            <div>
                                                <p className="font-medium text-foreground">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' || user.role === 'super_admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-secondary text-secondary-foreground'
                                            }`}>
                                            {user.role === 'admin' || user.role === 'super_admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => toggleUserStatus(user.id)}
                                            disabled={user.id === adminUser?.id}
                                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                        >
                                            {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => toggleUserRole(user.id)}
                                            disabled={user.id === adminUser?.id}
                                            className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onUserDelete(user)}
                                            disabled={user.id === adminUser?.id}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;