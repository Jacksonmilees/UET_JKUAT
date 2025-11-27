
import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import NotificationToast from './NotificationToast';
import BottomNavigation from './BottomNavigation';
import InstallPrompt from './InstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import BackToTop from './BackToTop';
import { Route, RoutePage } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    setRoute: (route: Route) => void;
    currentRoute: RoutePage;
}

const Layout: React.FC<LayoutProps> = ({ children, setRoute, currentRoute }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block">
                <Header setRoute={setRoute} currentRoute={currentRoute} />
            </div>

            {/* Mobile Header - Simple, compact */}
            <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-bold text-indigo-600">UET JKUAT</h1>
                    <div className="flex items-center gap-2">
                        {/* Add mobile menu button here if needed */}
                    </div>
                </div>
            </div>

            {/* Main Content - Mobile optimized padding */}
            <main className="flex-grow pb-4 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                    {children}
                </div>
            </main>

            {/* Footer - Hidden on mobile */}
            <div className="hidden md:block">
                <Footer />
            </div>

            {/* Bottom Navigation - Mobile only */}
            <BottomNavigation currentRoute={currentRoute} setRoute={setRoute} />

            {/* Install Prompt */}
            <InstallPrompt />

            {/* Offline Indicator */}
            <OfflineIndicator />

            {/* Back to Top Button */}
            <BackToTop />

            {/* Notifications */}
            <NotificationToast />
        </div>
    );
};

export default Layout;
