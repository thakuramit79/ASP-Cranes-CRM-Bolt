import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Clipboard, 
  Cog, 
  CreditCard, 
  FileText,
  Home, 
  Image,
  Menu, 
  MessageSquare, 
  PieChart, 
  Settings, 
  Users,
  Building2, 
  X,
  Handshake
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
  end?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <Home size={20} />,
    href: '/dashboard',
    roles: ['admin', 'sales_agent', 'operations_manager', 'operator'],
    end: true,
  },
  {
    label: 'Leads',
    icon: <Clipboard size={20} />,
    href: '/leads',
    roles: ['admin', 'sales_agent'],
  },
  {
    label: 'Deals',
    icon: <Handshake size={20} />,
    href: '/deals',
    roles: ['admin', 'sales_agent'],
  },
  {
    label: 'Quotations',
    icon: <CreditCard size={20} />,
    href: '/quotations',
    roles: ['admin', 'sales_agent'],
  },
  {
    label: 'Customers',
    icon: <Building2 size={20} />,
    href: '/customers',
    roles: ['admin', 'sales_agent', 'operations_manager'],
  },
  {
    label: 'Job Scheduling',
    icon: <Calendar size={20} />,
    href: '/jobs',
    roles: ['admin', 'operations_manager', 'operator'],
  },
  {
    label: 'Site Assessment',
    icon: <Image size={20} />,
    href: '/site-assessment',
    roles: ['admin', 'operations_manager'],
  },
  {
    label: 'Configuration',
    icon: <Cog size={20} />,
    href: '/config',
    roles: ['admin', 'operations_manager'],
  },
  {
    label: 'User Management',
    icon: <Users size={20} />,
    href: '/config/users',
    roles: ['admin'],
  },
  {
    label: 'Equipment',
    icon: <Settings size={20} />,
    href: '/config/equipment',
    roles: ['admin', 'operations_manager'],
  },
  {
    label: 'Services',
    icon: <FileText size={20} />,
    href: '/config/services',
    roles: ['admin', 'operations_manager'],
  },
  {
    label: 'Feedback',
    icon: <MessageSquare size={20} />,
    href: '/feedback',
    roles: ['admin', 'operations_manager'],
  },
  {
    label: 'Analytics',
    icon: <BarChart3 size={20} />,
    href: '/analytics',
    roles: ['admin', 'sales_agent', 'operations_manager'],
  },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!user) return null;
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));
  
  const isActive = (href: string, end?: boolean) => {
    if (end) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <>
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-white p-2 rounded-md shadow-sm"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <motion.div
        className={`fixed inset-0 z-30 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={toggleMobileMenu} />
        <motion.aside
          className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3 }}
        >
          {renderSidebarContent(false)}
        </motion.aside>
      </motion.div>
      
      <aside 
        className={`hidden md:block ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-white shadow-sm overflow-y-auto transition-all duration-300`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>
    </>
  );
  
  function renderSidebarContent(collapsed: boolean) {
    return (
      <div className="flex flex-col h-full">
        <div className={`p-4 border-b flex ${collapsed ? 'justify-center' : 'justify-between'} items-center`}>
          <div className={`flex items-center ${collapsed ? '' : 'space-x-2'}`}>
            {collapsed ? (
              <img 
                src="/crane-icon.svg" 
                alt="ASP Cranes" 
                className="h-8 w-8 object-contain"
              />
            ) : (
              <img 
                src="/crane-icon.svg" 
                alt="ASP Cranes" 
                className="h-12 w-auto object-contain"
              />
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleCollapse}
            >
              <Menu size={20} />
            </Button>
          )}
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center ${
                    collapsed ? 'justify-center' : 'space-x-3'
                  } px-3 py-2 rounded-md transition-colors group relative ${
                    isActive(item.href, item.end)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transform translate-x-2 group-hover:translate-x-0 transition-all">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={`p-4 border-t mt-auto ${collapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="flex-shrink-0">
              <img
                src={user.avatar || 'https://images.pexels.com/photos/4126743/pexels-photo-4126743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}