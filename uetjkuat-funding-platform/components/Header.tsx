
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LayoutDashboard, LogOut, Menu, ShoppingCart, X } from 'lucide-react';
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
    { name: 'Merch', page: 'merch' },
    { name: 'News', page: 'news' },
    { name: 'About', page: 'home', hash: '#about' },

  ];

  return (
    <>
      <header className="bg-secondary-900/95 shadow-lg sticky top-0 z-40 border-b border-secondary-800 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => setRoute({ page: 'home' })} className="flex items-center gap-2 focus:outline-none group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <span className="text-white font-serif font-bold text-xl">U</span>
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">
              UET JKUAT
            </span>
          </button>

          {/* Desktop Nav */}
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
                  className={`relative px-2 py-1 text-sm font-medium transition-colors duration-300 ${isActive || isHomeHashActive
                      ? 'text-primary-400'
                      : 'text-secondary-400 hover:text-primary-300'
                    }`}
                >
                  {link.name}
                  {(isActive || isHomeHashActive) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full shadow-glow animate-fade-in"></span>
                  )}
                </a>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setRoute({ page: 'cart' })}
              className="relative p-2 text-secondary-400 hover:text-primary-400 transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-primary-950 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-glow animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setRoute({ page: 'dashboard' })}
                  className="flex items-center gap-2 bg-secondary-800 text-white px-4 py-2 rounded-xl hover:bg-secondary-700 border border-secondary-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:border-primary-500/30">
                  <LayoutDashboard className="w-4 h-4 text-primary-400" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-secondary-400 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all duration-300 font-medium">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRoute({ page: 'login' })}
                  className="text-secondary-300 hover:text-white font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setRoute({ page: 'register' })}
                  className="bg-primary-600 text-white px-5 py-2 rounded-xl hover:bg-primary-500 transition-all duration-300 font-bold shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setRoute({ page: 'cart' })} className="relative text-secondary-400 hover:text-primary-400 p-2">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-primary-950 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-glow">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-secondary-200 hover:text-white focus:outline-none p-2"
            >
              <Menu className="h-7 w-7" />
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
