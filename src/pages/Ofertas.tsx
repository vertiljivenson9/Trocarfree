import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui-custom/Icon';
import type { Oferta } from '@/types';

const estadoLabels: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500' },
  aceptada: { label: 'Aceptada', color: 'bg-green-500' },
  rechazada: { label: 'Rechazada', color: 'bg-red-500' },
  cancelada: { label: 'Cancelada', color: 'bg-gray-500' },
  completada: { label: 'Completada', color: 'bg-blue-500' },
};

export const Ofertas: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();
  
  const [ofertasRecibidas, setOfertasRecibidas] = useState<Oferta[]>([]);
  const [ofertasEnviadas, setOfertasEnviadas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOfertas();
  }, [isAuthenticated]);

  const loadOfertas = async () => {
    setLoading(true);
    
    // Ofertas recibidas
    const { data: recibidas } = await supabase
      .from('ofertas')
      .select('*, objeto_oferente:objetos!objeto_oferente_id(*), objeto_receptor:objetos!objeto_receptor_id(*), oferente:perfiles!oferente_id(*)')
      .eq('receptor_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (recibidas) setOfertasRecibidas(recibidas as Oferta[]);

    // Ofertas enviadas
    const { data: enviadas } = await supabase
      .from('ofertas')
      .select('*, objeto_oferente:objetos!objeto_oferente_id(*), objeto_receptor:objetos!objeto_receptor_id(*), receptor:perfiles!receptor_id(*)')
      .eq('oferente_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (enviadas) setOfertasEnviadas(enviadas as Oferta[]);
    
    setLoading(false);
  };

  const handleAceptar = async (oferta: Oferta) => {
    const { error } = await (supabase as any)
      .from('ofertas')
      .update({ estado: 'aceptada' })
      .eq('id', oferta.id);
    
    if (!error) {
      // Update object statuses
      await (supabase as any).from('objetos').update({ estado: 'en_trueque' }).eq('id', oferta.objeto_oferente_id);
      await (supabase as any).from('objetos').update({ estado: 'en_trueque' }).eq('id', oferta.objeto_receptor_id);
      loadOfertas();
    }
  };

  const handleRechazar = async (oferta: Oferta) => {
    const { error } = await (supabase as any)
      .from('ofertas')
      .update({ estado: 'rechazada' })
      .eq('id', oferta.id);
    
    if (!error) loadOfertas();
  };

  const handleCancelar = async (oferta: Oferta) => {
    const { error } = await (supabase as any)
      .from('ofertas')
      .update({ estado: 'cancelada' })
      .eq('id', oferta.id);
    
    if (!error) loadOfertas();
  };

  const OfertaCard: React.FC<{ oferta: Oferta; tipo: 'recibida' | 'enviada' }> = ({ oferta, tipo }) => {
    const estado = estadoLabels[oferta.estado];
    const miObjeto = tipo === 'recibida' ? oferta.objeto_receptor : oferta.objeto_oferente;
    const suObjeto = tipo === 'recibida' ? oferta.objeto_oferente : oferta.objeto_receptor;
    const otraPersona = tipo === 'recibida' ? oferta.oferente : oferta.receptor;

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge className={`${estado.color} text-white`}>
              {estado.label}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(oferta.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Mi objeto */}
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <img
                src={miObjeto?.imagenes?.[0] || '/placeholder-object.jpg'}
                alt={miObjeto?.titulo}
                className="w-16 h-16 object-cover rounded-lg mr-3"
              />
              <div>
                <p className="text-xs text-gray-500 mb-1">{tipo === 'recibida' ? 'Tu objeto' : 'Ofreces'}</p>
                <p className="font-medium text-sm">{miObjeto?.titulo}</p>
              </div>
            </div>

            {/* Su objeto */}
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <img
                src={suObjeto?.imagenes?.[0] || '/placeholder-object.jpg'}
                alt={suObjeto?.titulo}
                className="w-16 h-16 object-cover rounded-lg mr-3"
              />
              <div>
                <p className="text-xs text-gray-500 mb-1">{tipo === 'recibida' ? 'Te ofrecen' : 'Recibes'}</p>
                <p className="font-medium text-sm">{suObjeto?.titulo}</p>
              </div>
            </div>
          </div>

          {oferta.mensaje && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Mensaje:</span> {oferta.mensaje}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                {otraPersona?.avatar_url ? (
                  <img src={otraPersona.avatar_url} alt={otraPersona.nombre} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="user" size={16} />
                )}
              </div>
              <span className="text-sm">{otraPersona?.nombre}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {oferta.estado === 'pendiente' && tipo === 'recibida' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRechazar(oferta)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Icon name="x" size={16} className="mr-1" />
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAceptar(oferta)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Icon name="check" size={16} className="mr-1" />
                    Aceptar
                  </Button>
                </>
              )}
              {oferta.estado === 'pendiente' && tipo === 'enviada' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelar(oferta)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Icon name="x" size={16} className="mr-1" />
                  Cancelar
                </Button>
              )}
              {oferta.estado === 'aceptada' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/chat/${oferta.id}`)}
                >
                  <Icon name="message" size={16} className="mr-1" />
                  Chat
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f172a]">Mis Ofertas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus propuestas de intercambio</p>
        </div>

        <Tabs defaultValue="recibidas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="recibidas">
              Recibidas
              {ofertasRecibidas.filter(o => o.estado === 'pendiente').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {ofertasRecibidas.filter(o => o.estado === 'pendiente').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="enviadas">Enviadas</TabsTrigger>
          </TabsList>

          <TabsContent value="recibidas">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-40 rounded-lg" />
                ))}
              </div>
            ) : ofertasRecibidas.length > 0 ? (
              ofertasRecibidas.map((oferta) => (
                <OfertaCard key={oferta.id} oferta={oferta} tipo="recibida" />
              ))
            ) : (
              <div className="text-center py-16">
                <Icon name="message" size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No has recibido ofertas
                </h3>
                <p className="text-gray-500 mb-4">
                  Publica objetos para recibir propuestas de intercambio
                </p>
                <Button onClick={() => navigate('/publicar')}>
                  Publicar objeto
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="enviadas">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-40 rounded-lg" />
                ))}
              </div>
            ) : ofertasEnviadas.length > 0 ? (
              ofertasEnviadas.map((oferta) => (
                <OfertaCard key={oferta.id} oferta={oferta} tipo="enviada" />
              ))
            ) : (
              <div className="text-center py-16">
                <Icon name="send" size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No has enviado ofertas
                </h3>
                <p className="text-gray-500 mb-4">
                  Explora objetos y haz propuestas de intercambio
                </p>
                <Button onClick={() => navigate('/explorar')}>
                  Explorar objetos
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
