import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Link2,
  User,
  MoreHorizontal,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type DashboardTab = 'overview' | 'account' | 'purchases' | 'recharge' | 'profile';

interface DashboardBottomNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const DashboardBottomNav: React.FC<DashboardBottomNavProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Main 4 tabs shown in bottom nav
  const mainTabs: { icon: typeof LayoutDashboard; label: string; tab: DashboardTab }[] = [
    { icon: LayoutDashboard, label: 'Home', tab: 'overview' },
    { icon: Wallet, label: 'Account', tab: 'account' },
    { icon: CreditCard, label: 'History', tab: 'purchases' },
    { icon: Link2, label: 'Recharge', tab: 'recharge' },
  ];

  // Additional tabs in "More" menu
  const moreTabs: { icon: typeof User; label: string; tab: DashboardTab }[] = [
    { icon: User, label: 'Profile', tab: 'profile' },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Panel */}
      {showMore && (
        <div className="fixed bottom-16 left-0 right-0 z-50 p-4 lg:hidden animate-slide-up">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-4 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">More Options</h3>
              <button 
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full hover:bg-secondary"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {moreTabs.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    onTabChange(item.tab);
                    setShowMore(false);
                  }}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl transition-colors
                    ${activeTab === item.tab
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* Admin Panel for admins */}
              {isAdmin && (
                <a
                  href="/admin"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-xs font-medium">Admin</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((item) => (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                ${activeTab === item.tab
                  ? 'text-primary'
                  : 'text-muted-foreground'
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.tab ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className={`
              flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
              ${showMore || activeTab === 'profile'
                ? 'text-primary'
                : 'text-muted-foreground'
              }
            `}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default DashboardBottomNav;
