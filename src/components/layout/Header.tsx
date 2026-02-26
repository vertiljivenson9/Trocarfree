import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui-custom/Icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { user, perfil, signOut, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center">
              <Icon name="refresh" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">Truque Local</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link to="/explorar" className="text-gray-300 hover:text-white transition-colors">
              Explorar
            </Link>
            {isAuthenticated && (
              <Link to="/publicar" className="text-gray-300 hover:text-white transition-colors">
                Publicar
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/ofertas" className="hidden md:flex items-center text-gray-300 hover:text-white">
                  <Icon name="message" size={20} />
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center overflow-hidden">
                        {perfil?.avatar_url ? (
                          <img 
                            src={perfil.avatar_url} 
                            alt={perfil.nombre} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="user" size={18} />
                        )}
                      </div>
                      <span className="hidden sm:block text-sm">{perfil?.nombre || user?.email}</span>
                      <Icon name="chevron-down" size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/perfil')}>
                      <Icon name="user" size={16} className="mr-2" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/mis-objetos')}>
                      <Icon name="refresh" size={16} className="mr-2" />
                      Mis Objetos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/ofertas')}>
                      <Icon name="message" size={16} className="mr-2" />
                      Ofertas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/ajustes')}>
                      <Icon name="settings" size={16} className="mr-2" />
                      Ajustes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <Icon name="logout" size={16} className="mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  className="bg-[#10b981] hover:bg-[#059669] text-white"
                  onClick={() => navigate('/registro')}
                >
                  Registrarse
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/explorar" 
                className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explorar
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/publicar" 
                    className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Publicar
                  </Link>
                  <Link 
                    to="/ofertas" 
                    className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ofertas
                  </Link>
                  <Link 
                    to="/perfil" 
                    className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
