'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Earthquake {
  id: string | number;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
  source: string;
}

interface AFADResponse {
  httpStatus: number;
  serverDate: string;
  metadata: {
    total: number;
  };
  result: Array<{
    eventID: string;
    location: string;
    latitude: number;
    longitude: number;
    depth: number;
    magnitude: number;
    date: string;
  }>;
}

export default function EarthquakeList() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAFADData = async () => {
    try {
      // AFAD verileri için alternatif API
      const response = await axios.get('https://api.berkealp.net/kandilli/');
      
      return response.data.map((quake: any) => ({
        id: quake.earthquake_id || Date.now().toString(),
        date: new Date(quake.date).toLocaleDateString('tr-TR'),
        time: new Date(quake.date).toLocaleTimeString('tr-TR'),
        latitude: Number(quake.latitude),
        longitude: Number(quake.longitude),
        depth: Number(quake.depth),
        magnitude: Number(quake.magnitude),
        location: quake.location,
        source: 'KANDİLLİ'
      }));
    } catch (error) {
      console.error('AFAD verileri alınamadı:', error);
      return [];
    }
  };

  const fetchKandilliData = async () => {
    try {
      // Depremler.org API'sini kullanalım
      const response = await axios.get('https://api.depremler.org/');
      
      return response.data.earthquakes.map((quake: any) => ({
        id: quake.id || Date.now().toString(),
        date: new Date(quake.date).toLocaleDateString('tr-TR'),
        time: new Date(quake.date).toLocaleTimeString('tr-TR'),
        latitude: Number(quake.latitude),
        longitude: Number(quake.longitude),
        depth: Number(quake.depth),
        magnitude: Number(quake.magnitude),
        location: quake.location,
        source: 'DEPREMLER.ORG'
      }));
    } catch (error) {
      console.error('Kandilli verileri alınamadı:', error);
      return [];
    }
  };

  const fetchEarthquakeData = async () => {
    try {
      // Son güncelleme üzerinden en az 1 dakika geçtiyse API'yi çağır
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdate.getTime();
      if (timeDiff < 60000) { // 1 dakika = 60000 ms
        return earthquakes; // Mevcut verileri kullan
      }

      const response = await axios.get(
        'https://earthquake.usgs.gov/fdsnws/event/1/query',
        {
          params: {
            format: 'geojson',
            starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endtime: new Date().toISOString(),
            minlatitude: 30,
            maxlatitude: 45,
            minlongitude: 25,
            maxlongitude: 45,
            minmagnitude: 1.0,
            orderby: 'magnitude'
          }
        }
      );

      setLastUpdate(now);
      const features = response.data.features;
      return features.map((feature: any) => ({
        id: feature.id,
        date: new Date(feature.properties.time).toLocaleDateString('tr-TR'),
        time: new Date(feature.properties.time).toLocaleTimeString('tr-TR'),
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: Number((feature.geometry.coordinates[2]).toFixed(1)),
        magnitude: Number(feature.properties.mag.toFixed(1)),
        location: feature.properties.place,
        source: 'USGS'
      }));
    } catch (error) {
      console.error('USGS verileri alınamadı:', error);
      return earthquakes; // Hata durumunda mevcut verileri kullan
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEarthquakeData();
        if (data.length > 0) {
          setEarthquakes(data.sort((a: Earthquake, b: Earthquake) => b.magnitude - a.magnitude));
          setError(null);
        }
      } catch (error) {
        console.error('Veriler alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 6000); // 6 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Veriler yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-sm text-blue-700">
          Son 24 saat içinde Türkiye ve çevresinde meydana gelen depremler gösteriliyor.
          Veriler 6 saniyede bir kontrol edilmektedir. Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
        </p>
      </div>
      {earthquakes.map((quake) => (
        <div
          key={quake.id}
          className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
            quake.magnitude >= 4.0
              ? 'border-l-4 border-red-500'
              : quake.magnitude >= 3.0
              ? 'border-l-4 border-orange-500'
              : 'border-l-4 border-yellow-500'
          }`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">{quake.location}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{quake.date} {quake.time}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{quake.source}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center justify-center rounded-full w-12 h-12 ${
                  quake.magnitude >= 4.0
                    ? 'bg-red-100 text-red-600'
                    : quake.magnitude >= 3.0
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <span className="text-xl font-bold">{quake.magnitude.toFixed(1)}</span>
                </div>
                <div className="mt-2 flex items-center justify-end text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>{quake.depth} km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}