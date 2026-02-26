import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Objeto } from '@/types';

// Fix Leaflet default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for objects
const objectIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #064e3b;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// User location icon
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="
    background-color: #10b981;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapaObjetosProps {
  objetos: Objeto[];
  userLocation: { lat: number; lng: number };
  onMarkerClick?: (objeto: Objeto) => void;
}

export const MapaObjetos: React.FC<MapaObjetosProps> = ({
  objetos,
  userLocation,
  onMarkerClick,
}) => {
  const center: [number, number] = [userLocation.lat, userLocation.lng];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      <Marker position={center} icon={userIcon}>
        <Popup>Tu ubicación</Popup>
      </Marker>

      {/* Object markers */}
      {objetos.map((objeto) => {
        // For demo purposes, generate random nearby locations if not available
        const lat = objeto.ubicacion?.lat || userLocation.lat + (Math.random() - 0.5) * 0.02;
        const lng = objeto.ubicacion?.lng || userLocation.lng + (Math.random() - 0.5) * 0.02;
        
        return (
          <Marker
            key={objeto.id}
            position={[lat, lng]}
            icon={objectIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(objeto),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <img
                  src={objeto.imagenes?.[0] || '/placeholder-object.jpg'}
                  alt={objeto.titulo}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm">{objeto.titulo}</h3>
                <p className="text-xs text-gray-500 mb-2">
                  {objeto.usuario?.nombre}
                </p>
                {objeto.distancia_km && (
                  <p className="text-xs text-[#10b981]">
                    {objeto.distancia_km < 1 
                      ? 'A menos de 1 km' 
                      : `${objeto.distancia_km.toFixed(1)} km`}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
