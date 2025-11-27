
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
        <div className="flex flex-col min-h-screen bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-50 transition-colors duration-300">
            {/* Header - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block sticky top-0 z-50">
                <Header setRoute={setRoute} currentRoute={currentRoute} />
            </div>

            {/* Mobile Header - Glassmorphism & Premium */}
            <div className="md:hidden sticky top-0 z-40 bg-secondary-900/80 backdrop-blur-md border-b border-secondary-800 shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3" onClick={() => setRoute({ page: 'home' })}>
                        <img src="/icons/favicon-96x96.png" alt="Logo" className="w-8 h-8 rounded-full shadow-glow" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent tracking-tight">
                            UET JKUAT
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Placeholder for potential mobile actions (e.g., search, notifications) */}
                    </div>
                </div>
            </div>

            {/* Main Content - Mobile optimized padding */}
            <main className="flex-grow pb-20 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fade-in">
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
