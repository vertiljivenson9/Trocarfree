import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui-custom/Icon';
import type { Objeto } from '@/types';

interface OfertaModalProps {
  objetoReceptor: Objeto;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfertaModal: React.FC<OfertaModalProps> = ({
  objetoReceptor,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthContext();
  const [misObjetos, setMisObjetos] = useState<Objeto[]>([]);
  const [selectedObjeto, setSelectedObjeto] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMisObjetos();
  }, []);

  const loadMisObjetos = async () => {
    const { data } = await supabase
      .from('objetos')
      .select('*')
      .eq('usuario_id', user!.id)
      .eq('estado', 'disponible');
    
    if (data) setMisObjetos(data as Objeto[]);
  };

  const handleSubmit = async () => {
    if (!selectedObjeto) {
      setError('Selecciona uno de tus objetos para ofrecer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase as any).from('ofertas').insert({
        objeto_oferente_id: selectedObjeto,
        objeto_receptor_id: objetoReceptor.id,
        oferente_id: user!.id,
        receptor_id: objetoReceptor.usuario_id,
        mensaje: mensaje || null,
        estado: 'pendiente',
      });

      if (insertError) {
        setError('Error al enviar la oferta');
      } else {
        onSuccess();
      }
    } catch {
      setError('Error al enviar la oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Hacer oferta</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <Icon name="x" size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Object being requested */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Estás solicitando:</p>
            <Card>
              <CardContent className="p-4 flex items-center">
                <img
                  src={objetoReceptor.imagenes?.[0] || '/placeholder-object.jpg'}
                  alt={objetoReceptor.titulo}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />
                <div>
                  <p className="font-semibold">{objetoReceptor.titulo}</p>
                  <p className="text-sm text-gray-500">de {objetoReceptor.usuario?.nombre}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Select my object */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Selecciona qué ofreces a cambio:</p>
            {misObjetos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {misObjetos.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjeto(obj.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedObjeto === obj.id
                        ? 'border-[#10b981] ring-2 ring-[#10b981]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={obj.imagenes?.[0] || '/placeholder-object.jpg'}
                      alt={obj.titulo}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{obj.titulo}</p>
                    </div>
                    {selectedObjeto === obj.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center">
                        <Icon name="check" size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Icon name="alert" size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No tienes objetos disponibles</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    onClose();
                    window.location.href = '/publicar';
                  }}
                >
                  Publicar objeto
                </Button>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Mensaje opcional:</p>
            <Textarea
              placeholder="Escribe un mensaje para el propietario..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedObjeto || loading}
              className="flex-1 bg-[#064e3b] hover:bg-[#065f46]"
            >
              {loading ? (
                <span className="flex items-center">
                  <Icon name="refresh" size={18} className="animate-spin mr-2" />
                  Enviando...
                </span>
              ) : (
                'Enviar oferta'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
