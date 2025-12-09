
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationContextType {
    notification: Notification | null;
    notifications: Notification[];
    addNotification: (message: string, type?: NotificationType, duration?: number) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
    clearNotification: () => void;
    removeNotification: (id: number) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    notification: null,
    notifications: [],
    addNotification: () => {},
    showSuccess: () => {},
    showError: () => {},
    showWarning: () => {},
    showInfo: () => {},
    clearNotification: () => {},
    removeNotification: () => {},
});

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notification, setNotification] = useState<Notification | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType = 'info', duration: number = 4000) => {
        const id = new Date().getTime();
        const newNotification = { id, message, type, duration };
        setNotification(newNotification);
        setNotifications(prev => [...prev, newNotification].slice(-5)); // Keep last 5
        
        // Auto remove after duration
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    const showSuccess = useCallback((message: string) => addNotification(message, 'success'), [addNotification]);
    const showError = useCallback((message: string) => addNotification(message, 'error', 6000), [addNotification]);
    const showWarning = useCallback((message: string) => addNotification(message, 'warning', 5000), [addNotification]);
    const showInfo = useCallback((message: string) => addNotification(message, 'info'), [addNotification]);

    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Listen for custom notification events from other contexts
    useEffect(() => {
        const handleNotification = (event: CustomEvent<string | { message: string; type?: NotificationType }>) => {
            // Handle both string and object formats
            if (typeof event.detail === 'string') {
                addNotification(event.detail, 'success');
            } else {
                const { message, type } = event.detail;
                addNotification(message, type || 'info');
            }
        };
        window.addEventListener('app-notification', handleNotification as EventListener);
        return () => {
            window.removeEventListener('app-notification', handleNotification as EventListener);
        };
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{ 
            notification, 
            notifications,
            addNotification, 
            showSuccess,
            showError,
            showWarning,
            showInfo,
            clearNotification,
            removeNotification 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook for easy use
export const useNotification = () => {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};