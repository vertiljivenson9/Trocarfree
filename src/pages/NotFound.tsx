import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui-custom/Icon';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="alert" size={48} className="text-gray-400" />
        </div>
        <h1 className="text-6xl font-bold text-[#0f172a] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/">
          <Button className="bg-[#064e3b] hover:bg-[#065f46]">
            <Icon name="home" size={18} className="mr-2" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};
