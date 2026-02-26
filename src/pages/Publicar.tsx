import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@/components/ui-custom/Icon';
import { LocationPicker } from '@/components/mapa/LocationPicker';
import type { Categoria } from '@/types';

const condiciones = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'casi_nuevo', label: 'Casi nuevo' },
  { value: 'bueno', label: 'Bueno' },
  { value: 'usado', label: 'Usado' },
  { value: 'para_repuesto', label: 'Para repuesto' },
];

export const Publicar: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();
  const { location, requestLocation } = useLocation();
  
  const [step, setStep] = useState(1);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [condicion, setCondicion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCategorias();
    requestLocation();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location) {
      setSelectedLocation({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  const loadCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('orden');
    if (data) setCategorias(data as Categoria[]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imagenes.length + files.length > 5) {
      setError('Máximo 5 imágenes permitidas');
      return;
    }

    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Compress image
      const compressed = await compressImage(file);
      newImages.push(compressed);
    }

    setImagenes([...imagenes, ...newImages]);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Max dimensions
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // For demo, use base64 images directly
      const { error: insertError } = await (supabase as any).from('objetos').insert({
        titulo,
        descripcion,
        condicion,
        categoria_id: parseInt(categoriaId),
        usuario_id: user!.id,
        imagenes: imagenes,
        ubicacion: selectedLocation 
          ? `POINT(${selectedLocation.lng} ${selectedLocation.lat})`
          : null,
        estado: 'disponible',
      });

      if (insertError) {
        setError('Error al publicar el objeto');
      } else {
        navigate('/mis-objetos');
      }
    } catch {
      setError('Error al publicar el objeto');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return titulo.trim() && descripcion.trim() && condicion && categoriaId;
      case 2:
        return imagenes.length > 0;
      case 3:
        return selectedLocation !== null;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f172a]">Publicar Objeto</h1>
          <p className="text-gray-600 mt-2">Completa los pasos para publicar tu objeto</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s === step
                    ? 'bg-[#064e3b] text-white'
                    : s < step
                    ? 'bg-[#10b981] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <Icon name="check" size={20} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-[#10b981]' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Describe el objeto que quieres intercambiar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Bicicleta de montaña"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el objeto, su estado, características..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicion">Condición *</Label>
                <Select value={condicion} onValueChange={setCondicion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la condición" />
                  </SelectTrigger>
                  <SelectContent>
                    {condiciones.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Images */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Fotos del objeto</CardTitle>
              <CardDescription>Sube hasta 5 fotos de tu objeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {imagenes.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                ))}
                {imagenes.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#10b981] hover:bg-green-50 transition-colors">
                    <Icon name="camera" size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Añadir foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {imagenes.length} de 5 fotos subidas
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <CardDescription>Selecciona dónde está disponible el objeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestLocation}
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
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <Icon name="arrow-left" size={18} className="mr-2" />
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-[#064e3b] hover:bg-[#065f46]"
            >
              Siguiente
              <Icon name="arrow-right" size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="bg-[#10b981] hover:bg-[#059669]"
            >
              {loading ? (
                <span className="flex items-center">
                  <Icon name="refresh" size={18} className="animate-spin mr-2" />
                  Publicando...
                </span>
              ) : (
                <>
                  <Icon name="check" size={18} className="mr-2" />
                  Publicar Objeto
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
