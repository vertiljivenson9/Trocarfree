import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui-custom/Icon';

export const MobileNav: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/explorar', label: 'Explorar', icon: 'search' },
    ...(isAuthenticated ? [
      { path: '/publicar', label: 'Publicar', icon: 'plus' },
      { path: '/ofertas', label: 'Ofertas', icon: 'message' },
    ] : []),
    { path: isAuthenticated ? '/perfil' : '/login', label: 'Perfil', icon: 'user' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
              isActive(item.path) ? 'text-[#064e3b]' : 'text-gray-500'
            }`}
          >
            <Icon 
              name={item.icon as any} 
              size={24} 
              className={isActive(item.path) ? 'text-[#064e3b]' : 'text-gray-500'}
            />
            <span className="text-xs">{item.label}</span>
            {isActive(item.path) && (
              <div className="absolute bottom-1 w-1 h-1 bg-[#10b981] rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};
