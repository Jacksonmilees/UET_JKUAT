
import React, { createContext, useState, useCallback, ReactNode } from 'react';

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

    return (
        <NotificationContext.Provider value={{ notification, addNotification, clearNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};