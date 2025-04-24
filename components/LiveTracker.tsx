'use client';

import { useEffect, useState } from 'react';

interface LiveStats {
  last24Hours: number;
  lastHour: number;
  magnitude4Plus: number;
  activeRegions: string[];
}

export default function LiveTracker() {
  const [stats, setStats] = useState<LiveStats>({
    last24Hours: 0,
    lastHour: 0,
    magnitude4Plus: 0,
    activeRegions: []
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Her saniye saati güncelle
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const response = await fetch(
          'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
          new URLSearchParams({
            format: 'geojson',
            starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endtime: new Date().toISOString(),
            minlatitude: '30',
            maxlatitude: '45',
            minlongitude: '25',
            maxlongitude: '45',
            minmagnitude: '1.0'
          })
        );

        const data = await response.json();
        const features = data.features;

        // Son 24 saat içindeki depremler
        const last24Hours = features.length;

        // Son 1 saat içindeki depremler
        const lastHour = features.filter(
          (quake: any) =>
            Date.now() - new Date(quake.properties.time).getTime() <= 60 * 60 * 1000
        ).length;

        // Magnitude 4+ depremler
        const magnitude4Plus = features.filter(
          (quake: any) => quake.properties.mag >= 4.0
        ).length;

        // Aktif bölgeler (son 24 saatte en çok deprem olan 3 bölge)
        const regions = features.reduce((acc: { [key: string]: number }, quake: any) => {
          const location = quake.properties.place;
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {});

        const activeRegions = Object.entries(regions)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([region]) => region);

        setStats({
          last24Hours,
          lastHour,
          magnitude4Plus,
          activeRegions
        });
      } catch (error) {
        console.error('İstatistikler alınamadı:', error);
      }
    };

    calculateStats();
    const interval = setInterval(calculateStats, 60000); // Her dakika güncelle

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="ml-2 text-lg font-semibold text-white">Canlı Takip</h3>
          </div>
          <div className="flex items-center bg-purple-400 bg-opacity-30 rounded-full px-3 py-1">
            <svg className="h-4 w-4 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="ml-1 text-sm text-purple-100">
              {currentTime.toLocaleTimeString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 transform transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-500 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Son 24 Saat
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-700">{stats.last24Hours}</div>
            <div className="text-sm text-blue-600 mt-1">Toplam Deprem</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 transform transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-500 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Son 1 Saat
              </span>
            </div>
            <div className="text-3xl font-bold text-green-700">{stats.lastHour}</div>
            <div className="text-sm text-green-600 mt-1">Yeni Deprem</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 transform transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-red-500 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                Büyük Deprem
              </span>
            </div>
            <div className="text-3xl font-bold text-red-700">{stats.magnitude4Plus}</div>
            <div className="text-sm text-red-600 mt-1">4+ Büyüklük</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 transform transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-500 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Aktif Bölge
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-700">{stats.activeRegions.length}</div>
            <div className="text-sm text-purple-600 mt-1">Risk Bölgesi</div>
          </div>
        </div>

        {/* Active Regions */}
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            En Aktif Bölgeler
          </h4>
          <div className="space-y-3">
            {stats.activeRegions.map((region, index) => (
              <div
                key={region}
                className="bg-gray-50 rounded-lg p-3 flex items-center justify-between transform transition-all duration-200 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                    {index + 1}
                  </span>
                  <span className="ml-3 text-gray-700">{region}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Yüksek Risk
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 