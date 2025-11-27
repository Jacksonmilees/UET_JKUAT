
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
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => setRoute({ page: 'home' })} className="flex items-center gap-2 focus:outline-none group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <span className="text-primary-foreground font-bold text-xl">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
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
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {link.name}
                  {(isActive || isHomeHashActive) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in"></span>
                  )}
                </a>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setRoute({ page: 'cart' })}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setRoute({ page: 'dashboard' })}
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all duration-300 font-medium text-sm border border-border">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-muted-foreground hover:text-destructive px-3 py-2 rounded-lg hover:bg-destructive/10 transition-all duration-300">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRoute({ page: 'login' })}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => setRoute({ page: 'register' })}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setRoute({ page: 'cart' })} className="relative text-muted-foreground hover:text-foreground p-2">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-muted-foreground hover:text-foreground focus:outline-none p-2"
            >
              <Menu className="h-6 w-6" />
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
