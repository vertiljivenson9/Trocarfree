export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          nombre: string
          avatar_url: string | null
          telefono: string | null
          bio: string | null
          ubicacion: unknown | null
          ubicacion_texto: string | null
          reputacion: number
          intercambios_completados: number
          created_at: string
        }
        Insert: {
          id: string
          nombre: string
          avatar_url?: string | null
          telefono?: string | null
          bio?: string | null
          ubicacion?: unknown | null
          ubicacion_texto?: string | null
          reputacion?: number
          intercambios_completados?: number
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          avatar_url?: string | null
          telefono?: string | null
          bio?: string | null
          ubicacion?: unknown | null
          ubicacion_texto?: string | null
          reputacion?: number
          intercambios_completados?: number
          created_at?: string
        }
      }
      categorias: {
        Row: {
          id: number
          nombre: string
          slug: string
          descripcion: string
          icono: string
          color: string
          orden: number
        }
        Insert: {
          id?: number
          nombre: string
          slug: string
          descripcion?: string
          icono?: string
          color?: string
          orden?: number
        }
        Update: {
          id?: number
          nombre?: string
          slug?: string
          descripcion?: string
          icono?: string
          color?: string
          orden?: number
        }
      }
      objetos: {
        Row: {
          id: number
          titulo: string
          descripcion: string
          condicion: 'nuevo' | 'casi_nuevo' | 'bueno' | 'usado' | 'para_repuesto'
          imagenes: string[]
          categoria_id: number
          usuario_id: string
          ubicacion: unknown | null
          estado: 'disponible' | 'en_trueque' | 'intercambiado'
          destacado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          titulo: string
          descripcion: string
          condicion: 'nuevo' | 'casi_nuevo' | 'bueno' | 'usado' | 'para_repuesto'
          imagenes?: string[]
          categoria_id: number
          usuario_id: string
          ubicacion?: unknown | null
          estado?: 'disponible' | 'en_trueque' | 'intercambiado'
          destacado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          titulo?: string
          descripcion?: string
          condicion?: 'nuevo' | 'casi_nuevo' | 'bueno' | 'usado' | 'para_repuesto'
          imagenes?: string[]
          categoria_id?: number
          usuario_id?: string
          ubicacion?: unknown | null
          estado?: 'disponible' | 'en_trueque' | 'intercambiado'
          destacado?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ofertas: {
        Row: {
          id: number
          objeto_oferente_id: number
          objeto_receptor_id: number
          oferente_id: string
          receptor_id: string
          mensaje: string | null
          estado: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada' | 'completada'
          respuesta: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          objeto_oferente_id: number
          objeto_receptor_id: number
          oferente_id: string
          receptor_id: string
          mensaje?: string | null
          estado?: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada' | 'completada'
          respuesta?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          objeto_oferente_id?: number
          objeto_receptor_id?: number
          oferente_id?: string
          receptor_id?: string
          mensaje?: string | null
          estado?: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada' | 'completada'
          respuesta?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mensajes: {
        Row: {
          id: number
          oferta_id: number
          emisor_id: string
          contenido: string
          created_at: string
        }
        Insert: {
          id?: number
          oferta_id: number
          emisor_id: string
          contenido: string
          created_at?: string
        }
        Update: {
          id?: number
          oferta_id?: number
          emisor_id?: string
          contenido?: string
          created_at?: string
        }
      }
      valoraciones: {
        Row: {
          id: number
          oferta_id: number
          evaluador_id: string
          evaluado_id: string
          puntuacion: number
          comentario: string | null
          created_at: string
        }
        Insert: {
          id?: number
          oferta_id: number
          evaluador_id: string
          evaluado_id: string
          puntuacion: number
          comentario?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          oferta_id?: number
          evaluador_id?: string
          evaluado_id?: string
          puntuacion?: number
          comentario?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_objetos_cercanos: {
        Args: {
          lat_ref: number
          lng_ref: number
          radio_km: number
          categoria_filter?: number
        }
        Returns: {
          id: number
          titulo: string
          descripcion: string
          condicion: string
          imagenes: string[]
          distancia_km: number
          usuario_id: string
          nombre_usuario: string
          avatar_usuario: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
