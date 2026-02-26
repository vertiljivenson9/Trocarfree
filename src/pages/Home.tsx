import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui-custom/Icon';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import { CategoriaChip } from '@/components/objetos/CategoriaChip';
import type { Objeto, Categoria } from '@/types';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { location, requestLocation } = useLocation();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);

  useEffect(() => {
    requestLocation();
    loadCategorias();
  }, []);

  useEffect(() => {
    if (location) {
      loadObjetosCercanos();
    } else {
      loadObjetos();
    }
  }, [location, selectedCategoria]);

  const loadCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('orden');
    if (data) setCategorias(data as Categoria[]);
  };

  const loadObjetos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('objetos')
      .select('*, categoria:categorias(*), usuario:perfiles(*)')
      .eq('estado', 'disponible')
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (data) setObjetos(data as Objeto[]);
    setLoading(false);
  };

  const loadObjetosCercanos = async () => {
    if (!location) return;
    
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('buscar_objetos_cercanos', {
      lat_ref: location.lat,
      lng_ref: location.lng,
      radio_km: 50,
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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <section className="bg-[#064e3b] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Intercambia objetos con tus vecinos
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Truque Local conecta personas para intercambiar bienes sin usar dinero. 
              Dale una nueva vida a lo que ya no usas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/publicar">
                  <Button size="lg" className="bg-[#10b981] hover:bg-[#059669] text-white px-8">
                    <Icon name="plus" size={20} className="mr-2" />
                    Publicar Objeto
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/registro">
                    <Button size="lg" className="bg-[#10b981] hover:bg-[#059669] text-white px-8">
                      Empezar Ahora
                    </Button>
                  </Link>
                  <Link to="/explorar">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Explorar Objetos
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#0f172a]">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="upload" size={32} className="text-[#10b981]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Publica</h3>
                <p className="text-gray-600">
                  Sube fotos y describe los objetos que quieres intercambiar
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="refresh" size={32} className="text-[#10b981]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Propón</h3>
                <p className="text-gray-600">
                  Encuentra objetos que te interesen y haz una oferta de trueque
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="check" size={32} className="text-[#10b981]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Intercambia</h3>
                <p className="text-gray-600">
                  Acuerda el encuentro y realiza el intercambio en persona
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#0f172a]">
            Explora por categorías
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
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
      </section>

      {/* Featured Objects */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#0f172a]">
              {location ? 'Objetos cerca de ti' : 'Objetos destacados'}
            </h2>
            <Link to="/explorar">
              <Button variant="outline" className="flex items-center">
                Ver todos
                <Icon name="arrow-right" size={18} className="ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : objetos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {objetos.map((objeto) => (
                <ObjetoCard key={objeto.id} objeto={objeto} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="search" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron objetos</p>
              {location && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSelectedCategoria(null)}
                >
                  Ver todos los objetos
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-[#0f172a] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Únete a la economía colaborativa
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Miles de personas ya están intercambiando objetos en sus comunidades. 
              Sé parte del cambio hacia un consumo más sostenible.
            </p>
            <Link to="/registro">
              <Button size="lg" className="bg-[#10b981] hover:bg-[#059669] text-white px-8">
                Crear cuenta gratuita
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
