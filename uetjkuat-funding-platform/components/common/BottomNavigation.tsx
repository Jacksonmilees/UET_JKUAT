import React from 'react';
import { IconHome, IconUser, IconShoppingBag, IconNewspaper, IconSettings } from '../icons';
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
      icon: IconHome,
      route: { page: 'home' as RoutePage },
      show: true,
    },
    {
      id: 'merch',
      label: 'Shop',
      icon: IconShoppingBag,
      route: { page: 'merch' as RoutePage },
      show: true,
    },
    {
      id: 'news',
      label: 'News',
      icon: IconNewspaper,
      route: { page: 'news' as RoutePage },
      show: true,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: IconUser,
      route: { page: 'dashboard' as RoutePage },
      show: !!user,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: IconSettings,
      route: { page: 'admin' as RoutePage },
      show: user?.role === 'admin',
    },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setRoute(item.route)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-500'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
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
