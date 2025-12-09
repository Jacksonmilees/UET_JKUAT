
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface Notification {
    id: number;
    message: string;
}

interface NotificationContextType {
    notification: Notification | null;
    addNotification: (message: string) => void;
    clearNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    notification: null,
    addNotification: () => {},
    clearNotification: () => {},
});

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notification, setNotification] = useState<Notification | null>(null);

    const addNotification = useCallback((message: string) => {
        const id = new Date().getTime();
        setNotification({ id, message });
    }, []);

    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Listen for custom notification events from other contexts
    useEffect(() => {
        const handleNotification = (event: CustomEvent<string>) => {
            addNotification(event.detail);
        };
        window.addEventListener('app-notification', handleNotification as EventListener);
        return () => {
            window.removeEventListener('app-notification', handleNotification as EventListener);
        };
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{ notification, addNotification, clearNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};