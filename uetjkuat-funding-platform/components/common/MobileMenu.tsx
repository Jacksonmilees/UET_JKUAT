import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { X, LayoutDashboard, LogOut, ShoppingCart, ChevronRight, LogIn, UserPlus } from 'lucide-react';
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
            <div className="fixed inset-0 bg-secondary-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            {/* Menu */}
            <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-secondary-900 shadow-2xl p-6 animate-slide-right border-r border-secondary-800 flex flex-col`}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
                            <span className="text-white font-serif font-bold text-xl">U</span>
                        </div>
                        <span className="text-xl font-bold font-serif text-white tracking-tight">UET JKUAT</span>
                    </div>
                    <button onClick={onClose} className="text-secondary-400 hover:text-white transition-colors p-2 rounded-full hover:bg-secondary-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col space-y-2 flex-grow">
                    {navLinks.map(link => {
                        if (link.adminOnly && user?.role !== 'admin') {
                            return null;
                        }
                        const isActive = currentRoute === link.page && !link.hash;
                        const isHomeHashActive = currentRoute === 'home' && (link.page === 'home' && !link.hash);
                        const activeClass = isActive || isHomeHashActive
                            ? 'bg-primary-500/10 text-primary-400 font-bold border-l-4 border-primary-500'
                            : 'text-secondary-300 hover:bg-secondary-800 hover:text-white border-l-4 border-transparent';

                        return (
                            <button
                                key={link.name}
                                onClick={() => handleNavigation(link.page, link.hash)}
                                className={`flex items-center justify-between text-left text-lg px-4 py-3 rounded-r-xl transition-all duration-300 ${activeClass}`}
                            >
                                {link.name}
                                {(isActive || isHomeHashActive) && <ChevronRight className="w-5 h-5" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-secondary-800 my-6"></div>

                <div className="flex flex-col space-y-4">
                    {user ? (
                        <>
                            <button
                                onClick={() => handleNavigation('dashboard')}
                                className="flex items-center gap-3 text-lg px-4 py-3 rounded-xl text-white bg-secondary-800 hover:bg-secondary-700 transition-colors border border-secondary-700"
                            >
                                <LayoutDashboard className="w-5 h-5 text-primary-500" />
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 text-lg px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAuthNavigation('login')}
                                className="flex items-center justify-center gap-2 bg-transparent text-white px-4 py-3 rounded-xl hover:bg-secondary-800 transition duration-300 border border-secondary-600 font-semibold"
                            >
                                <LogIn className="w-4 h-4" /> Login
                            </button>
                            <button
                                onClick={() => handleAuthNavigation('register')}
                                className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-xl hover:bg-primary-500 transition duration-300 font-bold shadow-glow"
                            >
                                <UserPlus className="w-4 h-4" /> Join
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
