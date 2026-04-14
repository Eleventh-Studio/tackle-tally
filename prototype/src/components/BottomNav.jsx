import React from 'react';
import { Zap, Images, Users, Layers, BarChart2, User } from 'lucide-react';
import { useNavigation } from '@/components/NavigationContext';

const navItems = [
  { icon: Zap, label: 'Action', page: 'Home' },
  { icon: Images, label: 'Gallery', page: 'Gallery' },
  { icon: Users, label: 'Community', page: 'Community' },
  { icon: Layers, label: 'Sessions', page: 'Sessions' },
  { icon: BarChart2, label: 'Charts', page: 'Charts' },
  { icon: User, label: 'Profile', page: 'Profile' },
];

export default function BottomNav({ currentPage }) {
  const { navigate, currentPage: navPage } = useNavigation();
  const activePage = currentPage || navPage;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-xl border-t border-gray-800/60 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map(({ icon: Icon, label, page }) => {
        const active = activePage === page;
        return (
          <button
            key={page}
            onClick={() => navigate(page)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
          >
            <Icon
              className={`w-5 h-5 transition-colors ${active ? 'text-[#CCFF00]' : 'text-gray-500'}`}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={`text-[9px] font-semibold uppercase tracking-wide transition-colors ${active ? 'text-[#CCFF00]' : 'text-gray-600'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}