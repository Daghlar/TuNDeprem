'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Earthquake {
  id: string;
  date: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
}

interface DynamicMapProps {
  earthquakes: Earthquake[];
  onEarthquakeSelect?: (earthquake: Earthquake) => void;
}

const DynamicMap: React.FC<DynamicMapProps> = ({ earthquakes, onEarthquakeSelect }) => {
  const mapRef = useRef<L.Map | null>(null);

  const getMarkerColor = (magnitude: number) => {
    if (magnitude >= 5) return '#FF0000';
    if (magnitude >= 4) return '#FF6B00';
    if (magnitude >= 3) return '#FFA500';
    return '#32CD32';
  };

  const getMarkerRadius = (magnitude: number) => {
    return Math.max(magnitude * 4, 8);
  };

  const handleMarkerClick = (earthquake: Earthquake) => {
    if (onEarthquakeSelect) {
      onEarthquakeSelect(earthquake);
    }
  };

  useEffect(() => {
    if (mapRef.current && earthquakes.length > 0) {
      const bounds = L.latLngBounds(
        earthquakes.map(eq => [eq.latitude, eq.longitude])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [earthquakes]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        center={[38.9637, 35.2433]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {earthquakes.map((earthquake) => (
          <CircleMarker
            key={earthquake.id}
            center={[earthquake.latitude, earthquake.longitude]}
            radius={getMarkerRadius(earthquake.magnitude)}
            pathOptions={{
              color: getMarkerColor(earthquake.magnitude),
              fillColor: getMarkerColor(earthquake.magnitude),
              fillOpacity: 0.7,
              weight: 2
            }}
            eventHandlers={{
              click: () => handleMarkerClick(earthquake)
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">
                  Büyüklük: {earthquake.magnitude.toFixed(1)}
                </div>
                <div className="mb-1">{earthquake.location}</div>
                <div className="text-gray-600">
                  Derinlik: {earthquake.depth} km
                </div>
                <div className="text-gray-600">
                  Tarih: {earthquake.date}
                </div>
                <button
                  onClick={() => handleMarkerClick(earthquake)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Detayları Göster
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DynamicMap; 