import React from 'react';
import { Home, ShoppingBag, Newspaper, Megaphone, User, LogIn } from 'lucide-react';
import { Route, RoutePage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

interface BottomNavigationProps {
  currentRoute: RoutePage;
  setRoute: (route: Route) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentRoute, setRoute }) => {
  const { user } = useAuth();
  const { isModuleVisible } = useSettings();

  // Define navigation items based on auth state
  const getNavItems = () => {
    if (user) {
      // Logged in user - show 5 icons
      const items = [
        { id: 'home', label: 'Home', icon: Home, route: 'home' as RoutePage },
        { id: 'merch', label: 'Shop', icon: ShoppingBag, route: 'merch' as RoutePage, module: 'merchandise' as const },
        { id: 'news', label: 'News', icon: Newspaper, route: 'news' as RoutePage, module: 'news' as const },
        { id: 'announcements', label: 'Updates', icon: Megaphone, route: 'announcements' as RoutePage, module: 'announcements' as const },
        { id: 'profile', label: 'Profile', icon: User, route: 'dashboard' as RoutePage },
      ];
      
      // Filter based on module visibility (for non-admin)
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return items.filter(item => !item.module || isModuleVisible(item.module));
      }
      return items;
    } else {
      // Not logged in - show 4 nav items + login
      return [
        { id: 'home', label: 'Home', icon: Home, route: 'home' as RoutePage },
        { id: 'merch', label: 'Shop', icon: ShoppingBag, route: 'merch' as RoutePage },
        { id: 'news', label: 'News', icon: Newspaper, route: 'news' as RoutePage },
        { id: 'announcements', label: 'Updates', icon: Megaphone, route: 'announcements' as RoutePage },
        { id: 'login', label: 'Login', icon: LogIn, route: 'login' as RoutePage },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route || 
            (item.id === 'profile' && currentRoute === 'dashboard') ||
            (item.id === 'login' && (currentRoute === 'login' || currentRoute === 'register'));

          return (
            <button
              key={item.id}
              onClick={() => setRoute({ page: item.route })}
              className={`group flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 w-12 h-1 bg-primary rounded-b-full" />
              )}
              
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 -translate-y-0.5' 
                  : 'group-hover:bg-secondary'
              }`}>
                <Icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-primary stroke-[2.5px]' 
                      : 'text-muted-foreground group-hover:text-foreground stroke-2'
                  }`} 
                />
              </div>
              
              <span className={`text-[10px] font-medium mt-0.5 transition-all duration-300 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
};

export default BottomNavigation;
