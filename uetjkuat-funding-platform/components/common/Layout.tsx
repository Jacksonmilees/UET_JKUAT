import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import NotificationToast from './NotificationToast';
import BottomNavigation from './BottomNavigation';
import InstallPrompt from './InstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import BackToTop from './BackToTop';
import DashboardLayout from './DashboardLayout';
import { Route, RoutePage } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    setRoute: (route: Route) => void;
    currentRoute: RoutePage;
}

const Layout: React.FC<LayoutProps> = ({ children, setRoute, currentRoute }) => {
    // List of routes that should use the Dashboard Layout
    // Note: 'admin' is excluded because AdminPage has its own sidebar
    const dashboardRoutes: RoutePage[] = ['dashboard', 'settings' as any];

    if (dashboardRoutes.includes(currentRoute)) {
        return (
            <DashboardLayout setRoute={setRoute} currentRoute={currentRoute}>
                {children}
                <NotificationToast />
            </DashboardLayout>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Header - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block sticky top-0 z-50">
                <Header setRoute={setRoute} currentRoute={currentRoute} />
            </div>

            {/* Mobile Header - Glassmorphism & Premium */}
            <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3" onClick={() => setRoute({ page: 'home' })}>
                        <img src="/icons/favicon-96x96.png" alt="Logo" className="w-8 h-8 rounded-full shadow-glow" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
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
