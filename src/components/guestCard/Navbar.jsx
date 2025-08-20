import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CreditCardIcon, 
  ClipboardDocumentListIcon, 
  UserPlusIcon, 
  ArrowUturnLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/guest-card-inventory', label: 'Request Card', icon: CreditCardIcon },
    { path: '/guest-card-inventory/pending', label: 'Pending Requests', icon: ClipboardDocumentListIcon },
    { path: '/guest-card-inventory/return', label: 'Return Card', icon: ArrowUturnLeftIcon },
    { path: '/guest-card-inventory/logs', label: 'Logs', icon: DocumentTextIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-troy-red shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <UserPlusIcon className="h-8 w-8 text-troy-gold" />
            <h1 className="text-xl font-bold text-white">Guest Card Inventory</h1>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-white text-troy-red font-medium'
                      : 'text-white hover:bg-red-700'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <select 
              className="bg-troy-red text-white border border-white rounded px-2 py-1"
              value={location.pathname}
              onChange={(e) => window.location.pathname = e.target.value}
            >
              {navItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
