# Truque Local

Aplicación web de marketplace para intercambio de bienes sin uso de dinero entre usuarios de proximidad geográfica.

## Características

- **Autenticación**: Registro e inicio de sesión con email/contraseña usando Supabase Auth
- **Publicación de objetos**: Formulario multi-paso con subida de imágenes y selección de ubicación
- **Descubrimiento**: Feed de objetos ordenados por proximidad geográfica
- **Sistema de ofertas**: Propón trueques seleccionando uno de tus objetos como contraparte
- **Chat integrado**: Comunicación entre usuarios para coordinar intercambios
- **Mapa interactivo**: Visualización de objetos cercanos usando Leaflet
- **Perfiles de usuario**: Gestión de reputación e historial de intercambios

## Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de datos**: Supabase (PostgreSQL + PostGIS)
- **Autenticación**: Supabase Auth
- **Mapas**: Leaflet
- **Almacenamiento**: Supabase Storage

## Configuración del entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Actualiza las variables de entorno con tus credenciales de Supabase.

3. Ejecuta el script SQL en `supabase-schema.sql` en el SQL Editor de Supabase para crear las tablas y funciones necesarias.

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Estructura del proyecto

```
src/
  components/
    layout/         # Header, Footer, Navigation
    objetos/        # Tarjetas, listados, formularios
    ofertas/        # Gestión de trueques
    mapa/           # Componentes de mapa
    ui/             # Componentes base (shadcn)
    ui-custom/      # Componentes personalizados
  contexts/         # Contextos de React (Auth)
  hooks/            # Custom hooks
  lib/
    supabase/       # Cliente y tipos de Supabase
  pages/            # Páginas de la aplicación
  types/            # Definiciones TypeScript
```

## Despliegue

La aplicación está configurada para desplegarse en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega

## Licencia

MIT
