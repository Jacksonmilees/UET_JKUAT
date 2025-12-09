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
import { useAuth } from '../../contexts/AuthContext';
import { User, LogIn, Bell, Search } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    setRoute: (route: Route) => void;
    currentRoute: RoutePage;
}

const Layout: React.FC<LayoutProps> = ({ children, setRoute, currentRoute }) => {
    const { user } = useAuth();
    
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

    // Check if it's the home page
    const isHomePage = currentRoute === 'home';

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Header - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block sticky top-0 z-50">
                <Header setRoute={setRoute} currentRoute={currentRoute} />
            </div>

            {/* Mobile Header - Modern & Minimal */}
            <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <button 
                        className="flex items-center gap-2.5" 
                        onClick={() => setRoute({ page: 'home' })}
                    >
                        <img 
                            src="/icons/favicon-96x96.png" 
                            alt="Logo" 
                            className="w-9 h-9 rounded-xl shadow-md" 
                        />
                        <span className="text-lg font-bold text-foreground">
                            UET JKUAT
                        </span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <button 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                            onClick={() => {/* TODO: Open search */}}
                        >
                            <Search className="w-4.5 h-4.5 text-muted-foreground" />
                        </button>
                        
                        {user ? (
                            <>
                                {/* Notifications */}
                                <button 
                                    className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                                    onClick={() => setRoute({ page: 'dashboard' })}
                                >
                                    <Bell className="w-4.5 h-4.5 text-muted-foreground" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                                </button>
                                
                                {/* Profile */}
                                <button 
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                    onClick={() => setRoute({ page: 'dashboard' })}
                                >
                                    <User className="w-4.5 h-4.5 text-primary" />
                                </button>
                            </>
                        ) : (
                            <button 
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                                onClick={() => setRoute({ page: 'login' })}
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Login</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow pb-20 md:pb-0">
                {isHomePage ? (
                    // Full width for home page hero
                    <div className="animate-fade-in">
                        {children}
                    </div>
                ) : (
                    // Container for other pages
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fade-in">
                        {children}
                    </div>
                )}
            </main>

            {/* Footer - Hidden on mobile, shown on desktop only for about page */}
            {currentRoute === 'about' && (
                <div className="hidden md:block">
                    <Footer />
                </div>
            )}

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
