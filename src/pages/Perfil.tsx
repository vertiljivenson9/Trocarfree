import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@/components/ui-custom/Icon';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import type { Objeto } from '@/types';

export const Perfil: React.FC = () => {
  const { isAuthenticated, user, perfil, refreshPerfil } = useAuthContext();
  const navigate = useNavigate();
  
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadObjetos();
    if (perfil) {
      setNombre(perfil.nombre);
      setTelefono(perfil.telefono || '');
      setBio(perfil.bio || '');
    }
  }, [isAuthenticated, perfil]);

  const loadObjetos = async () => {
    const { data } = await supabase
      .from('objetos')
      .select('*, categoria:categorias(*)')
      .eq('usuario_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (data) setObjetos(data as Objeto[]);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from('perfiles')
      .update({
        nombre,
        telefono: telefono || null,
        bio: bio || null,
      })
      .eq('id', user!.id);

    if (!error) {
      await refreshPerfil();
      setEditing(false);
    }
    setSaving(false);
  };

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-[#10b981] flex items-center justify-center overflow-hidden">
                {perfil.avatar_url ? (
                  <img
                    src={perfil.avatar_url}
                    alt={perfil.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="user" size={48} className="text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{perfil.nombre}</h1>
                    <p className="text-gray-500">{user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                      <div className="flex items-center">
                        <Icon name="star" size={18} className="text-yellow-400 mr-1" />
                        <span className="font-medium">{perfil.reputacion}/5</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="refresh" size={18} className="text-[#10b981] mr-1" />
                        <span className="font-medium">{perfil.intercambios_completados} intercambios</span>
                      </div>
                      {perfil.ubicacion_texto && (
                        <div className="flex items-center text-gray-500">
                          <Icon name="location" size={18} className="mr-1" />
                          {perfil.ubicacion_texto}
                        </div>
                      )}
                    </div>

                    {perfil.bio && (
                      <p className="mt-4 text-gray-600">{perfil.bio}</p>
                    )}

                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setEditing(true)}
                    >
                      <Icon name="edit" size={18} className="mr-2" />
                      Editar perfil
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="objetos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="objetos">Mis Objetos</TabsTrigger>
            <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
          </TabsList>

          <TabsContent value="objetos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mis objetos publicados</h2>
              <Button onClick={() => navigate('/publicar')}>
                <Icon name="plus" size={18} className="mr-2" />
                Publicar nuevo
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
                ))}
              </div>
            ) : objetos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {objetos.map((objeto) => (
                  <ObjetoCard key={objeto.id} objeto={objeto} />
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
          </TabsContent>

          <TabsContent value="ajustes">
            <Card>
              <CardHeader>
                <CardTitle>Ajustes de cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/cambiar-password')}
                >
                  <Icon name="settings" size={18} className="mr-2" />
                  Cambiar contraseña
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
