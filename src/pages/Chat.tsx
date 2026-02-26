import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui-custom/Icon';
import type { Mensaje, Oferta } from '@/types';

export const Chat: React.FC = () => {
  const { ofertaId } = useParams<{ ofertaId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOferta();
    loadMensajes();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`mensajes:${ofertaId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `oferta_id=eq.${ofertaId}`,
      }, (payload) => {
        setMensajes((prev) => [...prev, payload.new as Mensaje]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, ofertaId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const loadOferta = async () => {
    const { data } = await supabase
      .from('ofertas')
      .select('*, objeto_oferente:objetos!objeto_oferente_id(*), objeto_receptor:objetos!objeto_receptor_id(*)')
      .eq('id', parseInt(ofertaId || '0'))
      .single();
    
    if (data) setOferta(data as Oferta);
  };

  const loadMensajes = async () => {
    const { data } = await supabase
      .from('mensajes')
      .select('*, emisor:perfiles(*)')
      .eq('oferta_id', parseInt(ofertaId || '0'))
      .order('created_at', { ascending: true });
    
    if (data) setMensajes(data as Mensaje[]);
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const { error } = await (supabase as any).from('mensajes').insert({
      oferta_id: parseInt(ofertaId || '0'),
      emisor_id: user!.id,
      contenido: nuevoMensaje.trim(),
    });

    if (!error) {
      setNuevoMensaje('');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/ofertas')}
                className="mr-4"
              >
                <Icon name="arrow-left" size={20} />
              </Button>
              <div>
                <h1 className="font-semibold">Chat de intercambio</h1>
                <p className="text-sm text-gray-500">
                  {oferta?.objeto_oferente?.titulo} ↔ {oferta?.objeto_receptor?.titulo}
                </p>
              </div>
            </div>
            {oferta?.estado === 'aceptada' && (
              <Button
                size="sm"
                onClick={async () => {
                  await (supabase as any).from('ofertas').update({ estado: 'completada' }).eq('id', parseInt(ofertaId || '0'));
                  navigate('/ofertas');
                }}
              >
                <Icon name="check" size={16} className="mr-1" />
                Marcar completado
              </Button>
            )}
          </div>
        </Card>

        {/* Messages */}
        <Card className="mb-4">
          <div className="h-[calc(100vh-350px)] overflow-y-auto p-4">
            {mensajes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="message" size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No hay mensajes aún</p>
                <p className="text-sm">Envía el primer mensaje para coordinar el intercambio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mensajes.map((mensaje) => {
                  const isMe = mensaje.emisor_id === user?.id;
                  return (
                    <div
                      key={mensaje.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMe
                            ? 'bg-[#064e3b] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{mensaje.contenido}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMe ? 'text-green-200' : 'text-gray-500'
                          }`}
                        >
                          {formatDate(mensaje.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </Card>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button type="submit" className="bg-[#064e3b] hover:bg-[#065f46]">
            <Icon name="send" size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};
