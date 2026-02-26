import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Icon } from '@/components/ui-custom/Icon';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import { CategoriaChip } from '@/components/objetos/CategoriaChip';
import { MapaObjetos } from '@/components/mapa/MapaObjetos';
import type { Objeto, Categoria } from '@/types';

export const Explore: React.FC = () => {
  const { location, requestLocation } = useLocation();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Filtros
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [distancia, setDistancia] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    requestLocation();
    loadCategorias();
  }, []);

  useEffect(() => {
    loadObjetos();
  }, [location, selectedCategoria, distancia]);

  const loadCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('orden');
    if (data) setCategorias(data as Categoria[]);
  };

  const loadObjetos = async () => {
    setLoading(true);
    
    if (location) {
      const { data, error } = await (supabase as any).rpc('buscar_objetos_cercanos', {
        lat_ref: location.lat,
        lng_ref: location.lng,
        radio_km: distancia,
        categoria_filter: selectedCategoria,
      });

      if (data && !error) {
        const objetosFormateados: Objeto[] = (data as any[]).map((o: any) => ({
          id: o.id,
          titulo: o.titulo,
          descripcion: o.descripcion,
          condicion: o.condicion,
          imagenes: o.imagenes,
          categoria_id: 0,
          usuario_id: o.usuario_id,
          ubicacion: null,
          estado: 'disponible',
          destacado: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usuario: {
            id: o.usuario_id,
            nombre: o.nombre_usuario,
            avatar_url: o.avatar_usuario,
            telefono: null,
            bio: null,
            ubicacion: null,
            ubicacion_texto: null,
            reputacion: 0,
            intercambios_completados: 0,
            created_at: new Date().toISOString(),
          },
          distancia_km: o.distancia_km,
        }));
        setObjetos(objetosFormateados);
      }
    } else {
      // Cargar todos los objetos si no hay ubicación
      const { data } = await supabase
        .from('objetos')
        .select('*, categoria:categorias(*), usuario:perfiles(*)')
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });
      
      if (data) setObjetos(data as Objeto[]);
    }
    
    setLoading(false);
  };

  const filteredObjetos = useCallback(() => {
    if (!searchQuery) return objetos;
    
    const query = searchQuery.toLowerCase();
    return objetos.filter(obj => 
      obj.titulo.toLowerCase().includes(query) ||
      obj.descripcion.toLowerCase().includes(query)
    );
  }, [objetos, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Icon 
                name="search" 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
              />
              <Input
                type="text"
                placeholder="Buscar objetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-gray-100' : ''}
            >
              <Icon name="filter" size={18} className="mr-2" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
            >
              <Icon name={viewMode === 'grid' ? 'map' : 'menu'} size={18} className="mr-2" />
              {viewMode === 'grid' ? 'Mapa' : 'Lista'}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-4">
              {/* Categories */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Categoría
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategoria(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategoria === null
                        ? 'bg-[#064e3b] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <CategoriaChip
                      key={cat.id}
                      categoria={cat}
                      selected={selectedCategoria === cat.id}
                      onClick={() => setSelectedCategoria(
                        selectedCategoria === cat.id ? null : cat.id
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Distance */}
              {location && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Distancia máxima: {distancia} km
                  </label>
                  <Slider
                    value={[distancia]}
                    onValueChange={(value) => setDistancia(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories Quick Select */}
          {!showFilters && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategoria(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategoria === null
                    ? 'bg-[#064e3b] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <CategoriaChip
                  key={cat.id}
                  categoria={cat}
                  selected={selectedCategoria === cat.id}
                  onClick={() => setSelectedCategoria(
                    selectedCategoria === cat.id ? null : cat.id
                  )}
                  small
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {loading ? 'Cargando...' : `${filteredObjetos().length} objetos encontrados`}
          </p>
          {location && (
            <p className="text-sm text-[#10b981] flex items-center">
              <Icon name="location" size={16} className="mr-1" />
              Usando tu ubicación
            </p>
          )}
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredObjetos().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredObjetos().map((objeto) => (
                  <ObjetoCard key={objeto.id} objeto={objeto} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Icon name="search" size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No se encontraron objetos
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar los filtros o busca en otra área
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedCategoria(null);
                    setSearchQuery('');
                    setDistancia(50);
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </>
        )}

        {/* Map View */}
        {viewMode === 'map' && location && (
          <div className="h-[calc(100vh-300px)] rounded-lg overflow-hidden border">
            <MapaObjetos
              objetos={filteredObjetos()}
              userLocation={location}
              onMarkerClick={(objeto) => {
                // Navigate to object detail
                window.location.href = `/objeto/${objeto.id}`;
              }}
            />
          </div>
        )}

        {viewMode === 'map' && !location && (
          <div className="h-[calc(100vh-300px)] rounded-lg border flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Icon name="location" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Necesitamos tu ubicación para mostrar el mapa</p>
              <Button onClick={requestLocation}>
                <Icon name="location" size={18} className="mr-2" />
                Permitir ubicación
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
