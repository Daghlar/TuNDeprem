'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

interface Earthquake {
  id: string;
  date: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
}

interface MapProps {
  earthquakes: Earthquake[];
}

const getColorByMagnitude = (magnitude: number): string => {
  if (magnitude >= 5) return '#FF0000';
  if (magnitude >= 4) return '#FFA500';
  if (magnitude >= 3) return '#FFFF00';
  return '#00FF00';
};

const getMagnitudeRadius = (magnitude: number): number => {
  return Math.pow(2, magnitude) * 1000;
};

const Map: React.FC<MapProps> = ({ earthquakes }) => {
  const defaultCenter: [number, number] = [39.0, 35.0];
  const defaultZoom = 6;

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {earthquakes.map((earthquake) => (
          <CircleMarker
            key={earthquake.id}
            center={[earthquake.latitude, earthquake.longitude]}
            radius={8}
            pathOptions={{
              color: getColorByMagnitude(earthquake.magnitude),
              fillColor: getColorByMagnitude(earthquake.magnitude),
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div>
                <h3>Deprem Bilgileri</h3>
                <p>Büyüklük: {earthquake.magnitude}</p>
                <p>Derinlik: {earthquake.depth} km</p>
                <p>Konum: {earthquake.location}</p>
                <p>Tarih: {new Date(earthquake.date).toLocaleString('tr-TR')}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map; 