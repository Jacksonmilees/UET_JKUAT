import React from 'react';
import { Home, ShoppingBag, Newspaper, User, Settings } from 'lucide-react';
import { Route, RoutePage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface BottomNavigationProps {
  currentRoute: RoutePage;
  setRoute: (route: Route) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentRoute, setRoute }) => {
  const { user } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      route: { page: 'home' as RoutePage },
      show: true,
    },
    {
      id: 'merch',
      label: 'Shop',
      icon: ShoppingBag,
      route: { page: 'merch' as RoutePage },
      show: true,
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      route: { page: 'news' as RoutePage },
      show: true,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: User,
      route: { page: 'dashboard' as RoutePage },
      show: !!user,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Settings,
      route: { page: 'admin' as RoutePage },
      show: user?.role === 'admin' || user?.role === 'super_admin',
    },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary-900/95 backdrop-blur-lg border-t border-secondary-800 z-50 safe-area-bottom shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setRoute(item.route)}
                className={`group flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-secondary-400 hover:text-primary-400'
                }`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute top-0 w-12 h-1 bg-primary-500 rounded-b-lg shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-fade-in"></div>
                )}
                
                <div className={`relative p-1 transition-transform duration-300 ${isActive ? '-translate-y-1' : 'group-hover:-translate-y-0.5'}`}>
                  <Icon 
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'stroke-2'}`} 
                  />
                </div>
                
                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-0.5'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom navigation - Mobile Only */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default BottomNavigation;
