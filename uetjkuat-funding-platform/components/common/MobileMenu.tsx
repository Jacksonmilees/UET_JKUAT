import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { X, LayoutDashboard, LogOut, ShoppingCart, ChevronRight, LogIn, UserPlus, User, Settings, Shield } from 'lucide-react';
import { Route, RoutePage } from '../../types';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    setRoute: (route: Route) => void;
    navLinks: { name: string; page: RoutePage; hash?: string; adminOnly?: boolean }[];
    currentRoute: RoutePage;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, setRoute, navLinks, currentRoute }) => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();

    const handleNavigation = (page: RoutePage, hash?: string) => {
        if (hash) {
            setRoute({ page: 'home' });
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            setRoute({ page });
        }
        onClose();
    };

    const handleAuthNavigation = (page: RoutePage) => {
        setRoute({ page });
        onClose();
    };

    const handleLogout = () => {
        logout();
        setRoute({ page: 'home' });
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

            {/* Menu */}
            <div className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-card shadow-2xl animate-slide-right border-r border-border flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">U</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">UET JKUAT</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Profile Section (if logged in) */}
                {user && (
                    <div className="p-5 border-b border-border bg-secondary/30">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{user.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    {user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'Member'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navLinks.map(link => {
                        if (link.adminOnly && user?.role !== 'admin' && user?.role !== 'super_admin') {
                            return null;
                        }
                        const isActive = currentRoute === link.page && !link.hash;

                        return (
                            <button
                                key={link.name}
                                onClick={() => handleNavigation(link.page, link.hash)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-foreground hover:bg-secondary'
                                }`}
                            >
                                <span>{link.name}</span>
                                {isActive && <ChevronRight className="w-5 h-5" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border space-y-2">
                    {user ? (
                        <>
                            <button
                                onClick={() => handleNavigation('dashboard')}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                            >
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                <span className="font-medium text-foreground">My Dashboard</span>
                            </button>
                            
                            {(user.role === 'admin' || user.role === 'super_admin') && (
                                <button
                                    onClick={() => handleNavigation('admin')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                    <Shield className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-primary">Admin Panel</span>
                                </button>
                            )}
                            
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAuthNavigation('login')}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium border border-border"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </button>
                            <button
                                onClick={() => handleAuthNavigation('register')}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow-md"
                            >
                                <UserPlus className="w-4 h-4" />
                                Join
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
