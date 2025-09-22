import React from 'react';
import { Home, Users, TrendingUp, User, Layers } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'levels', label: 'My Levels', icon: Layers },
    { id: 'trade', label: 'Trade', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;