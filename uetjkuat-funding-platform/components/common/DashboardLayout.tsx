import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Route, RoutePage } from '../../types';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
    setRoute: (route: Route) => void;
    currentRoute: RoutePage;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, setRoute, currentRoute }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                setRoute={setRoute}
                currentRoute={currentRoute}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold capitalize hidden sm:block">
                            {currentRoute === 'dashboard' ? 'Overview' : currentRoute}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search (Optional) */}
                        <div className="hidden md:flex items-center relative">
                            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 rounded-full bg-secondary/50 border-none text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
                        </button>

                        {/* User Avatar (Mobile) */}
                        <div className="lg:hidden w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
