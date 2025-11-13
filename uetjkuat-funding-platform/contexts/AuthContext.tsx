
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, RegisterCredentials } from '../types';
import { NotificationContext } from './NotificationContext';
import api from '../services/api';

type LoginCredentials = Pick<User, 'email' | 'password'>;

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  toggleUserStatus: (userId: number) => Promise<void>;
  toggleUserRole: (userId: number) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useContext(NotificationContext);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        await refreshUser();
      }
    };
    checkAuth();
  }, []);

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.auth.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email}`,
          role: userData.role === 'super_admin' ? 'admin' : userData.role,
          status: userData.status,
          phoneNumber: userData.phone_number,
        });
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.login(credentials);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email}`,
          role: userData.role === 'super_admin' ? 'admin' : userData.role,
          status: userData.status,
          phoneNumber: userData.phone_number,
        });
        addNotification(`Welcome back, ${userData.name}!`);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error || 'Invalid email or password.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.register(credentials);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email}`,
          role: userData.role === 'super_admin' ? 'admin' : userData.role,
          status: userData.status,
          phoneNumber: credentials.phoneNumber,
          yearOfStudy: credentials.yearOfStudy,
          course: credentials.course,
          college: credentials.college,
          admissionNumber: credentials.admissionNumber,
          ministryInterest: credentials.ministryInterest,
          residence: credentials.residence,
        });
        addNotification(`Welcome, ${userData.name}! Your account has been created.`);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return false;
    }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setUsers([]);
    addNotification('You have been logged out.');
  };

  const toggleUserStatus = async (userId: number): Promise<void> => {
    try {
      const response = await api.users.toggleStatus(userId);
      if (response.success) {
        await loadUsers();
        addNotification('User status updated successfully.');
      } else {
        addNotification(response.error || 'Failed to update user status.');
      }
    } catch (err: any) {
      addNotification(err.message || 'Failed to update user status.');
    }
  };
  
  const toggleUserRole = async (userId: number): Promise<void> => {
    try {
      const response = await api.users.toggleRole(userId);
      if (response.success) {
        await loadUsers();
        addNotification('User role updated successfully.');
      } else {
        addNotification(response.error || 'Failed to update user role.');
      }
    } catch (err: any) {
      addNotification(err.message || 'Failed to update user role.');
    }
  };

  const deleteUser = async (userId: number): Promise<void> => {
    try {
      const response = await api.users.delete(userId);
      if (response.success) {
        await loadUsers();
        addNotification('User has been deleted.');
      } else {
        addNotification(response.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      addNotification(err.message || 'Failed to delete user.');
    }
  };

  const loadUsers = async (): Promise<void> => {
    try {
      const response = await api.users.getAll();
      if (response.success && response.data) {
        const usersData = response.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.email}`,
          role: u.role === 'super_admin' ? 'admin' : u.role,
          status: u.status,
          phoneNumber: u.phone_number,
        }));
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Load users if admin
  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user?.role]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      isLoading, 
      error, 
      login, 
      logout, 
      register, 
      toggleUserStatus, 
      toggleUserRole, 
      deleteUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
