'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([39.0, 35.9], 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;
    }
  }, []);

  return <div id="map" className="h-full w-full rounded-lg" />;
} 