import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui-custom/Icon';
import { OfertaModal } from '@/components/ofertas/OfertaModal';
import type { Objeto } from '@/types';

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

export const ObjetoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  
  const [objeto, setObjeto] = useState<Objeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadObjeto();
  }, [id]);

  const loadObjeto = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('objetos')
      .select('*, categoria:categorias(*), usuario:perfiles(*)')
      .eq('id', parseInt(id || '0'))
      .single();
    
    if (data) {
      setObjeto(data as Objeto);
    }
    setLoading(false);
  };

  const isOwner = user?.id === objeto?.usuario_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-video mb-4" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!objeto) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 text-center">
        <Icon name="alert" size={64} className="text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-600">Objeto no encontrado</h1>
        <Button onClick={() => navigate('/explorar')} className="mt-4">
          Volver a explorar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-gray-700">Inicio</button>
          <Icon name="chevron-right" size={16} className="mx-2" />
          <button onClick={() => navigate('/explorar')} className="hover:text-gray-700">Explorar</button>
          <Icon name="chevron-right" size={16} className="mx-2" />
          <span className="text-gray-900">{objeto.titulo}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img
                src={objeto.imagenes?.[selectedImage] || '/placeholder-object.jpg'}
                alt={objeto.titulo}
                className="w-full h-full object-cover"
              />
            </div>
            {objeto.imagenes && objeto.imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {objeto.imagenes.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-[#10b981]' : ''
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${objeto.titulo} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[#0f172a] mb-2">{objeto.titulo}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={`${condicionColors[objeto.condicion]} text-white`}>
                    {condicionLabels[objeto.condicion]}
                  </Badge>
                  {objeto.categoria && (
                    <Badge variant="outline" className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: objeto.categoria.color }}
                      />
                      {objeto.categoria.nombre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* User Card */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                    {objeto.usuario?.avatar_url ? (
                      <img
                        src={objeto.usuario.avatar_url}
                        alt={objeto.usuario.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="user" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{objeto.usuario?.nombre}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Icon name="star" size={14} className="text-yellow-400 mr-1" />
                      <span>{objeto.usuario?.reputacion || 0}/5</span>
                      <span className="mx-2">•</span>
                      <span>{objeto.usuario?.intercambios_completados || 0} intercambios</span>
                    </div>
                  </div>
                  {objeto.usuario?.ubicacion_texto && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <Icon name="location" size={16} className="mr-1" />
                      {objeto.usuario.ubicacion_texto}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{objeto.descripcion}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isOwner ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/editar-objeto/${objeto.id}`)}
                    className="flex-1"
                  >
                    <Icon name="edit" size={18} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (confirm('¿Estás seguro de que quieres eliminar este objeto?')) {
                        await (supabase as any).from('objetos').delete().eq('id', objeto.id);
                        navigate('/mis-objetos');
                      }
                    }}
                  >
                    <Icon name="trash" size={18} />
                  </Button>
                </>
              ) : (
                <>
                  {isAuthenticated ? (
                    <Button
                      className="flex-1 bg-[#064e3b] hover:bg-[#065f46]"
                      onClick={() => setShowOfertaModal(true)}
                    >
                      <Icon name="refresh" size={18} className="mr-2" />
                      Hacer oferta
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-[#064e3b] hover:bg-[#065f46]"
                      onClick={() => navigate('/login')}
                    >
                      Inicia sesión para ofertar
                    </Button>
                  )}
                  <Button variant="outline">
                    <Icon name="heart" size={18} />
                  </Button>
                  <Button variant="outline">
                    <Icon name="share" size={18} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Oferta Modal */}
      {showOfertaModal && (
        <OfertaModal
          objetoReceptor={objeto}
          onClose={() => setShowOfertaModal(false)}
          onSuccess={() => {
            setShowOfertaModal(false);
            navigate('/ofertas');
          }}
        />
      )}
    </div>
  );
};
