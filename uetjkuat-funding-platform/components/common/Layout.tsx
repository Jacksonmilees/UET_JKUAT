
import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import NotificationToast from './NotificationToast';
import { Route, RoutePage } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    setRoute: (route: Route) => void;
    currentRoute: RoutePage;
}

const Layout: React.FC<LayoutProps> = ({ children, setRoute, currentRoute }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header setRoute={setRoute} currentRoute={currentRoute} />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <NotificationToast />
        </div>
    );
};

export default Layout;
