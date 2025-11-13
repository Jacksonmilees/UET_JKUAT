

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { IconTrash } from '../icons';

interface UserManagementProps {
    onUserDelete: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserDelete }) => {
    const { users, toggleUserStatus, toggleUserRole, user: adminUser } = useAuth();
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600">User</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: User) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    <button
                                        onClick={() => toggleUserStatus(user.id)}
                                        disabled={user.id === adminUser?.id}
                                        className="px-3 py-1 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white bg-yellow-500 hover:bg-yellow-600"
                                    >
                                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => toggleUserRole(user.id)}
                                        disabled={user.id === adminUser?.id}
                                        className="px-3 py-1 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white bg-indigo-500 hover:bg-indigo-600"
                                    >
                                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                                    </button>
                                     <button
                                        onClick={() => onUserDelete(user)}
                                        disabled={user.id === adminUser?.id}
                                        className="p-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:bg-red-100"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;