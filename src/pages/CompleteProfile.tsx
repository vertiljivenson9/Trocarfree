import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@/components/ui-custom/Icon';
import { LocationPicker } from '@/components/mapa/LocationPicker';

export const CompleteProfile: React.FC = () => {
  const { user, refreshPerfil } = useAuthContext();
  const navigate = useNavigate();
  const { location, requestLocation, setManualLocation } = useLocation();
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [bio, setBio] = useState('');
  const [ubicacionTexto, setUbicacionTexto] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location) {
      setSelectedLocation({ lat: location.lat, lng: location.lng });
      if (location.address) {
        setUbicacionTexto(location.address);
      }
    }
  }, [location]);

  const handleGetLocation = () => {
    requestLocation();
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setManualLocation(lat, lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLocation) {
      setError('Por favor, selecciona tu ubicación');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await (supabase as any)
        .from('perfiles')
        .update({
          nombre,
          telefono: telefono || null,
          bio: bio || null,
          ubicacion_texto: ubicacionTexto || null,
          ubicacion: `POINT(${selectedLocation.lng} ${selectedLocation.lat})`,
        })
        .eq('id', user!.id);

      if (updateError) {
        setError('Error al actualizar el perfil');
      } else {
        await refreshPerfil();
        navigate('/');
      }
    } catch {
      setError('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="user" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Completa tu Perfil</h1>
          <p className="text-gray-600 mt-2">
            Necesitamos algunos datos para conectarte con vecinos cercanos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Estos datos serán visibles para otros usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+34 123 456 789"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Solo se mostrará cuando aceptes una oferta
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre ti (opcional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Cuéntanos un poco sobre ti..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Ubicación *</Label>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    className="flex items-center"
                  >
                    <Icon name="location" size={18} className="mr-2" />
                    Usar mi ubicación
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center"
                  >
                    <Icon name="map" size={18} className="mr-2" />
                    {showMap ? 'Ocultar mapa' : 'Seleccionar en mapa'}
                  </Button>
                </div>

                {showMap && (
                  <div className="h-64 rounded-lg overflow-hidden border">
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={selectedLocation || undefined}
                    />
                  </div>
                )}

                {selectedLocation && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-center">
                      <Icon name="check" size={16} className="mr-2" />
                      Ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ubicacionTexto">Dirección aproximada (opcional)</Label>
                  <Input
                    id="ubicacionTexto"
                    type="text"
                    placeholder="Ej: Centro de Madrid, cerca del Retiro"
                    value={ubicacionTexto}
                    onChange={(e) => setUbicacionTexto(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#064e3b] hover:bg-[#065f46]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Icon name="refresh" size={18} className="animate-spin mr-2" />
                    Guardando...
                  </span>
                ) : (
                  'Completar Perfil'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
