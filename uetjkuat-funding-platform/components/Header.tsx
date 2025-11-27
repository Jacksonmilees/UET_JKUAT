
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { IconLayoutDashboard, IconLogOut, IconMenu, IconShoppingCart } from './icons';
import MobileMenu from './common/MobileMenu';
import { Route, RoutePage } from '../types';

interface HeaderProps {
    setRoute: (route: Route) => void;
    currentRoute: RoutePage;
}

const Header: React.FC<HeaderProps> = ({ setRoute, currentRoute }) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setRoute({ page: 'home' });
  };

  const navLinks: { name: string; page: RoutePage; hash?: string, adminOnly?: boolean }[] = [
      { name: 'Home', page: 'home' },
      { name: 'Projects', page: 'home', hash: '#projects' },
      { name: 'Merch', page: 'merch'},
      { name: 'News', page: 'news' },
      { name: 'About', page: 'home', hash: '#about' },
      
  ];

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b-2 border-gradient-to-r from-blue-500 to-indigo-500 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => setRoute({ page: 'home' })} className="text-2xl font-serif font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent focus:outline-none hover:scale-105 transition-transform">
            UET JKUAT 🔥
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => {
                if (link.adminOnly && user?.role !== 'admin') {
                    return null;
                }
                const isActive = currentRoute === link.page && !link.hash;
                const isHomeHashActive = currentRoute === 'home' && (link.page === 'home' && !link.hash);

                return (
                 <a 
                    key={link.name}
                    href={link.hash || '#'}
                    onClick={(e) => {
                        if (link.hash) {
                           setRoute({ page: 'home' });
                           const element = document.querySelector(link.hash);
                           if (element) {
                                e.preventDefault();
                                element.scrollIntoView({ behavior: 'smooth' });
                           }
                        } else {
                            e.preventDefault();
                            setRoute({ page: link.page });
                        }
                    }} 
                    className={`transition duration-300 pb-1 border-b-2 ${isActive || isHomeHashActive ? 'border-primary-600 text-primary-600 font-semibold' : 'border-transparent text-secondary-600 hover:text-primary-600 font-medium'}`}
                >
                    {link.name}
                </a>
                )
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => setRoute({ page: 'cart' })} className="relative text-secondary-600 hover:text-primary-600 p-2 rounded-full hover:bg-secondary-100 transition-colors">
              <IconShoppingCart className="w-6 h-6"/>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            {user ? (
              <>
                <button 
                    onClick={() => setRoute({ page: 'dashboard' })} 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-bold shadow-lg hover:scale-105 transform">
                    <IconLayoutDashboard className="w-5 h-5"/>
                    Dashboard
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition duration-300 font-bold shadow-lg hover:scale-105 transform">
                    <IconLogOut className="w-5 h-5"/>
                    Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRoute({ page: 'login' })} className="bg-transparent text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 transition duration-300 border-2 border-blue-600 font-bold hover:scale-105 transform">
                    Login
                </button>
                <button onClick={() => setRoute({ page: 'register' })} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-bold shadow-lg hover:scale-105 transform">
                    Register
                </button>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={() => setRoute({ page: 'cart' })} className="relative text-secondary-600 hover:text-primary-600 p-2">
              <IconShoppingCart className="w-6 h-6"/>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-secondary-800 focus:outline-none p-2">
              <IconMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        setRoute={setRoute}
        navLinks={navLinks}
        currentRoute={currentRoute}
      />
    </>
  );
};

export default Header;
