
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { IconClose, IconLayoutDashboard, IconLogOut, IconShoppingCart } from '../icons';
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
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            
            {/* Menu */}
            <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 mobile-menu-enter-active`}>
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-bold font-serif text-secondary-800">UETJKUAT</span>
                    <button onClick={onClose} className="text-gray-600">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col space-y-2">
                    {navLinks.map(link => {
                        if (link.adminOnly && user?.role !== 'admin') {
                            return null;
                        }
                        const isActive = currentRoute === link.page && !link.hash;
                        const isHomeHashActive = currentRoute === 'home' && (link.page === 'home' && !link.hash);

                        return (
                            <button 
                                key={link.name} 
                                onClick={() => handleNavigation(link.page, link.hash)} 
                                className={`text-left text-lg px-4 py-2 rounded-md transition-colors ${isActive || isHomeHashActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-secondary-100'}`}
                            >
                                {link.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t my-6"></div>

                <div className="flex flex-col space-y-3">
                    {user ? (
                        <>
                            <button onClick={() => handleNavigation('dashboard')} className="flex items-center gap-3 text-lg px-4 py-2 rounded-md text-gray-700 hover:bg-secondary-100">
                                <IconLayoutDashboard className="w-5 h-5"/>
                                Dashboard
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-3 text-lg px-4 py-2 rounded-md text-red-500 hover:bg-red-50">
                                <IconLogOut className="w-5 h-5"/>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleAuthNavigation('login')} className="w-full text-center bg-transparent text-primary-600 px-4 py-2 rounded-md hover:bg-primary-50 transition duration-300 border border-primary-600 font-semibold">
                                Login
                            </button>
                            <button onClick={() => handleAuthNavigation('register')} className="w-full text-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition duration-300 font-semibold">
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
