import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current page from URL pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/network') return 'network';
    if (path === '/levels') return 'levels';
    if (path === '/trade') return 'trade';
    if (path === '/profile') return 'profile';
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPage());

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    // Navigate to the corresponding route
    navigate(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <main className="pb-20 px-4 pt-6">
          {children}
        </main>
        <BottomNavigation currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default Layout;
