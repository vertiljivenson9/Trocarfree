import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui-custom/Icon';
import type { Objeto } from '@/types';

const estadoLabels: Record<string, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-green-500' },
  en_trueque: { label: 'En trueque', color: 'bg-yellow-500' },
  intercambiado: { label: 'Intercambiado', color: 'bg-blue-500' },
};

export const MisObjetos: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadObjetos();
  }, [isAuthenticated]);

  const loadObjetos = async () => {
    const { data } = await supabase
      .from('objetos')
      .select('*, categoria:categorias(*)')
      .eq('usuario_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (data) setObjetos(data as Objeto[]);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este objeto?')) {
      await supabase.from('objetos').delete().eq('id', id);
      loadObjetos();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a]">Mis Objetos</h1>
            <p className="text-gray-600 mt-2">Gestiona tus publicaciones</p>
          </div>
          <Button onClick={() => navigate('/publicar')}>
            <Icon name="plus" size={18} className="mr-2" />
            Publicar nuevo
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
            ))}
          </div>
        ) : objetos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {objetos.map((objeto) => (
              <div key={objeto.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="relative aspect-[4/3]">
                  <img
                    src={objeto.imagenes?.[0] || '/placeholder-object.jpg'}
                    alt={objeto.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${estadoLabels[objeto.estado].color} text-white`}>
                      {estadoLabels[objeto.estado].label}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{objeto.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {objeto.categoria?.nombre}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/objeto/${objeto.id}`)}
                    >
                      <Icon name="eye" size={16} className="mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/editar-objeto/${objeto.id}`)}
                    >
                      <Icon name="edit" size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(objeto.id)}
                    >
                      <Icon name="trash" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <Icon name="upload" size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No has publicado objetos
            </h3>
            <p className="text-gray-500 mb-4">
              Empieza a intercambiar publicando tu primer objeto
            </p>
            <Button onClick={() => navigate('/publicar')}>
              Publicar objeto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
