import React from 'react';
import {
    LayoutDashboard,
    FolderHeart,
    CreditCard,
    ShoppingBag,
    Settings,
    LogOut,
    User,
    Menu,
    X,
    Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Route } from '../../types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setRoute: (route: Route) => void;
    currentRoute: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, setRoute, currentRoute }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', page: 'dashboard' },
        { icon: FolderHeart, label: 'Projects', page: 'home' }, // Assuming projects are on home for now or a specific projects page
        { icon: CreditCard, label: 'Donations', page: 'donations' }, // Need to check if this page exists, otherwise maybe 'cart' or 'history'
        { icon: ShoppingBag, label: 'Shop', page: 'merch' },
        { icon: Settings, label: 'Settings', page: 'settings' },
    ];

    const handleNavigation = (page: string) => {
        setRoute({ page: page as any });
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">U</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight">UET JKUAT</span>
                        </div>
                        <button
                            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavigation(item.page)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${currentRoute === item.page
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile (Bottom) */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
