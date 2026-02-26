import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui-custom/Icon';
import type { Objeto } from '@/types';

interface ObjetoCardProps {
  objeto: Objeto;
}

const condicionLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  casi_nuevo: 'Casi nuevo',
  bueno: 'Bueno',
  usado: 'Usado',
  para_repuesto: 'Para repuesto',
};

const condicionColors: Record<string, string> = {
  nuevo: 'bg-green-500',
  casi_nuevo: 'bg-emerald-500',
  bueno: 'bg-blue-500',
  usado: 'bg-yellow-500',
  para_repuesto: 'bg-gray-500',
};

export const ObjetoCard: React.FC<ObjetoCardProps> = ({ objeto }) => {
  const imagenPrincipal = objeto.imagenes?.[0] || '/placeholder-object.jpg';
  
  const formatDistance = (km: number) => {
    if (km < 1) return 'A menos de 1 km';
    return `${km.toFixed(1)} km`;
  };

  return (
    <Link to={`/objeto/${objeto.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imagenPrincipal}
            alt={objeto.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Estado Badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white ${condicionColors[objeto.condicion]}`}>
            {condicionLabels[objeto.condicion]}
          </div>

          {/* Destacado Badge */}
          {objeto.destacado && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-[#f59e0b] rounded-full text-xs font-medium text-white flex items-center">
              <Icon name="star" size={12} className="mr-1" />
              Destacado
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#064e3b] transition-colors">
            {objeto.titulo}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            {/* User */}
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                {objeto.usuario?.avatar_url ? (
                  <img
                    src={objeto.usuario.avatar_url}
                    alt={objeto.usuario.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="user" size={14} />
                )}
              </div>
              <span className="truncate max-w-[100px]">
                {objeto.usuario?.nombre || 'Usuario'}
              </span>
            </div>

            {/* Distance */}
            {objeto.distancia_km !== undefined && (
              <div className="flex items-center text-[#10b981]">
                <Icon name="location" size={14} className="mr-1" />
                <span>{formatDistance(objeto.distancia_km)}</span>
              </div>
            )}
          </div>

          {/* Categoria */}
          {objeto.categoria && (
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: objeto.categoria.color }}
              />
              {objeto.categoria.nombre}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
