// Tipos de la aplicación Truque Local

export interface Perfil {
  id: string;
  nombre: string;
  avatar_url: string | null;
  telefono: string | null;
  bio: string | null;
  ubicacion: { lat: number; lng: number } | null;
  ubicacion_texto: string | null;
  reputacion: number;
  intercambios_completados: number;
  created_at: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  icono: string;
  color: string;
  orden: number;
}

export type CondicionObjeto = 'nuevo' | 'casi_nuevo' | 'bueno' | 'usado' | 'para_repuesto';

export interface Objeto {
  id: number;
  titulo: string;
  descripcion: string;
  condicion: CondicionObjeto;
  imagenes: string[];
  categoria_id: number;
  usuario_id: string;
  ubicacion: { lat: number; lng: number } | null;
  estado: 'disponible' | 'en_trueque' | 'intercambiado';
  destacado: boolean;
  created_at: string;
  updated_at: string;
  // Campos join
  categoria?: Categoria;
  usuario?: Perfil;
  distancia_km?: number;
}

export type EstadoOferta = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada' | 'completada';

export interface Oferta {
  id: number;
  objeto_oferente_id: number;
  objeto_receptor_id: number;
  oferente_id: string;
  receptor_id: string;
  mensaje: string | null;
  estado: EstadoOferta;
  respuesta: string | null;
  created_at: string;
  updated_at: string;
  // Campos join
  objeto_oferente?: Objeto;
  objeto_receptor?: Objeto;
  oferente?: Perfil;
  receptor?: Perfil;
}

export interface Mensaje {
  id: number;
  oferta_id: number;
  emisor_id: string;
  contenido: string;
  created_at: string;
  // Campos join
  emisor?: Perfil;
}

export interface Valoracion {
  id: number;
  oferta_id: number;
  evaluador_id: string;
  evaluado_id: string;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface FiltrosBusqueda {
  categoria: number | null;
  distancia: number;
  query: string;
  condicion: CondicionObjeto | null;
}
