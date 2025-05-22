import React, { useState } from 'react';
import Sidebar from  './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        activeRoute={activeRoute} 
        onNavigate={onNavigate}
        onClose={closeSidebar}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-secondary-dark hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Abrir menu</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="max-w-lg w-full">
                <div className="text-right">
                  <span className="inline-block bg-accent/10 rounded-full px-3 py-1 text-sm font-semibold text-accent">
                    Administrador
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        <footer className="bg-white shadow-sm mt-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-3 text-center text-sm text-gray-500">
            Sistema de Gestão de Inventário © {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;