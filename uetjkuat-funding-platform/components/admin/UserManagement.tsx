
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Trash2, Shield, UserCheck, UserX, Key, Copy, Check, Plus, X, Eye, EyeOff } from 'lucide-react';
import { usersApi } from '../../services/api';

interface UserManagementProps {
    onUserDelete: (user: User) => void;
}

interface PasswordResetResult {
    user_name: string;
    user_email: string;
    new_password: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserDelete }) => {
    const { users, toggleUserStatus, toggleUserRole, user: adminUser } = useAuth();
    const [passwordResetResult, setPasswordResetResult] = useState<PasswordResetResult | null>(null);
    const [isResetting, setIsResetting] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [createAdminLoading, setCreateAdminLoading] = useState(false);
    const [newAdminCredentials, setNewAdminCredentials] = useState<{ email: string; password: string } | null>(null);
    const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', phone_number: '' });
    const [showPassword, setShowPassword] = useState(false);

    const isSuperAdmin = adminUser?.role === 'super_admin';

    const handleResetPassword = async (userId: number) => {
        setIsResetting(userId);
        try {
            const response = await usersApi.resetPassword(userId);
            if (response.success && response.data) {
                setPasswordResetResult(response.data);
            } else {
                alert('Failed to reset password');
            }
        } catch (error) {
            alert('Failed to reset password');
        } finally {
            setIsResetting(null);
        }
    };

    const copyCredentials = () => {
        if (passwordResetResult) {
            const text = `Email: ${passwordResetResult.user_email}\nPassword: ${passwordResetResult.new_password}`;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyNewAdminCredentials = () => {
        if (newAdminCredentials) {
            const text = `Email: ${newAdminCredentials.email}\nPassword: ${newAdminCredentials.password}`;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateAdminLoading(true);
        try {
            const response = await usersApi.createAdmin(newAdminForm);
            if (response.success && response.data) {
                setNewAdminCredentials(response.data.credentials);
                setNewAdminForm({ name: '', email: '', phone_number: '' });
            } else {
                alert('Failed to create admin');
            }
        } catch (error) {
            alert('Failed to create admin');
        } finally {
            setCreateAdminLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        Total Users: {users.length}
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setShowCreateAdmin(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Admin
                        </button>
                    )}
                </div>
            </div>

            {/* Create Admin Modal */}
            {showCreateAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Create Admin User</h3>
                            <button onClick={() => { setShowCreateAdmin(false); setNewAdminCredentials(null); }} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {newAdminCredentials ? (
                            <div className="space-y-4">
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                    <p className="text-green-600 font-medium mb-2">Admin created successfully!</p>
                                    <p className="text-sm text-muted-foreground">Copy and send these credentials to the new admin:</p>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
                                    <p><span className="text-muted-foreground">Email:</span> {newAdminCredentials.email}</p>
                                    <p><span className="text-muted-foreground">Password:</span> {showPassword ? newAdminCredentials.password : '••••••••••••'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                    <button
                                        onClick={copyNewAdminCredentials}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAdminForm.name}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20"
                                        placeholder="Admin Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newAdminForm.email}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        value={newAdminForm.phone_number}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, phone_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20"
                                        placeholder="254700000000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createAdminLoading}
                                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {createAdminLoading ? 'Creating...' : 'Create Admin'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Password Reset Result Modal */}
            {passwordResetResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Password Reset</h3>
                            <button onClick={() => setPasswordResetResult(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                <p className="text-green-600 font-medium">Password reset successfully!</p>
                                <p className="text-sm text-muted-foreground mt-1">Copy and send the new password to: <strong>{passwordResetResult.user_name}</strong></p>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
                                <p><span className="text-muted-foreground">Email:</span> {passwordResetResult.user_email}</p>
                                <p><span className="text-muted-foreground">Password:</span> {showPassword ? passwordResetResult.new_password : '••••••••••••'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                                <button
                                    onClick={copyCredentials}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy Credentials'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            {users.map((user: User) => {
                                const canModify = user.id !== adminUser?.id && user.role !== 'super_admin';
                                const canChangeRole = isSuperAdmin && user.role !== 'super_admin' && user.id !== adminUser?.id;
                                
                                return (
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'super_admin'
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                    : user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-secondary text-secondary-foreground'
                                            }`}>
                                                {(user.role === 'admin' || user.role === 'super_admin') && <Shield className="w-3 h-3 mr-1" />}
                                                {user.role === 'super_admin' ? 'Super Admin' : user.role}
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
                                        <td className="p-4 text-right space-x-1">
                                            {/* Reset Password */}
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                disabled={!canModify || isResetting === user.id}
                                                className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Reset Password"
                                            >
                                                <Key className={`w-4 h-4 ${isResetting === user.id ? 'animate-spin' : ''}`} />
                                            </button>
                                            {/* Toggle Status */}
                                            <button
                                                onClick={() => toggleUserStatus(user.id)}
                                                disabled={!canModify}
                                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                            >
                                                {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
                                            {/* Toggle Role - Only super_admin can do this */}
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => toggleUserRole(user.id)}
                                                    disabled={!canChangeRole}
                                                    className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            )}
                                            {/* Delete */}
                                            <button
                                                onClick={() => onUserDelete(user)}
                                                disabled={!canModify}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;