import React from 'react';
import { 
  Home, 
  Laptop, 
  FileText, 
  Settings,
  PlusCircle,
  LogOut,
  HelpCircle,
  CircleUser,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeRoute, onNavigate, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, route: 'dashboard' },
    { name: 'Equipamentos', icon: <Laptop size={20} />, route: 'equipment' },
    { name: 'Adicionar Novo', icon: <PlusCircle size={20} />, route: 'add-equipment' },
    { name: 'Relatórios', icon: <FileText size={20} />, route: 'reports' },
    { name: 'Configurações', icon: <Settings size={20} />, route: 'settings' },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-secondary transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-light">
            <div className="flex items-center">
              <Laptop className="h-8 w-8 text-accent" />
              <span className="ml-2 text-lg font-semibold text-white"></span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:text-accent transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.route}>
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-md transition-all duration-200 ${
                      activeRoute === item.route
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-300 hover:bg-secondary-light hover:text-white'
                    }`}
                    onClick={() => {
                      onNavigate(item.route);
                      onClose();
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-4 border-t border-secondary-light">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Suporte
              </h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <button className="flex items-center w-full px-4 py-3 rounded-md text-gray-300 hover:bg-secondary-light hover:text-white transition-colors">
                    <HelpCircle size={20} className="mr-3" />
                    <span>Ajuda & Suporte</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          <div className="p-4 border-t border-secondary-light">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <CircleUser size={20} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Administrador</p>
                <p className="text-xs text-gray-400">admin@exemplo.com</p>
              </div>
            </div>
            <button className="flex items-center w-full px-4 py-2 rounded-md text-gray-300 hover:bg-secondary-light hover:text-white transition-colors">
              <LogOut size={20} className="mr-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default Sidebar;