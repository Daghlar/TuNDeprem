'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const Map = dynamic(
  () => import('../components/DynamicMap'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    ),
    ssr: false
  }
);

interface Earthquake {
  id: string;
  date: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
}

interface FilterOptions {
  timeRange: number; // saat cinsinden
  minMagnitude: number;
  maxDepth: number | null;
}

export default function MapPage() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const [filter, setFilter] = useState<FilterOptions>({
    timeRange: 24,
    minMagnitude: 1.0,
    maxDepth: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateLastUpdateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    setLastUpdate(`${hours}:${minutes}:${seconds}`);
  };

  const fetchEarthquakes = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get('https://api.orhanaydogdu.com.tr/deprem/kandilli/live');
      if (response.data.status) {
        const formattedData = response.data.result.map((eq: any) => ({
          id: eq._id,
          date: new Date(eq.date).toLocaleString('tr-TR'),
          latitude: eq.geojson.coordinates[1],
          longitude: eq.geojson.coordinates[0],
          depth: eq.depth,
          magnitude: eq.mag,
          location: eq.title
        }));
        setEarthquakes(formattedData);
        updateLastUpdateTime();
      }
    } catch (error) {
      console.error('Veriler alınamadı:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 60000); // Her dakika güncelle
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filtreleme işlemi
    const filtered = earthquakes.filter(eq => {
      const eqDate = new Date(eq.date);
      const hoursDiff = (new Date().getTime() - eqDate.getTime()) / (1000 * 60 * 60);
      
      return (
        hoursDiff <= filter.timeRange &&
        eq.magnitude >= filter.minMagnitude &&
        (filter.maxDepth === null || eq.depth <= filter.maxDepth)
      );
    });
    setFilteredEarthquakes(filtered);
  }, [earthquakes, filter]);

  const getStatistics = () => {
    if (filteredEarthquakes.length === 0) return null;

    const totalMagnitude = filteredEarthquakes.reduce((sum, eq) => sum + eq.magnitude, 0);
    const totalDepth = filteredEarthquakes.reduce((sum, eq) => sum + eq.depth, 0);
    const maxMagnitude = Math.max(...filteredEarthquakes.map(eq => eq.magnitude));

    return {
      count: filteredEarthquakes.length,
      avgMagnitude: (totalMagnitude / filteredEarthquakes.length).toFixed(1),
      avgDepth: (totalDepth / filteredEarthquakes.length).toFixed(1),
      maxMagnitude: maxMagnitude.toFixed(1)
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Deprem verileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Deprem Haritası</h1>
                <p className="text-blue-100 mt-1">
                  Son güncelleme: {lastUpdate}
                </p>
              </div>
              <button
                onClick={fetchEarthquakes}
                disabled={isRefreshing}
                className={`px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-blue-50 transition-colors ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isRefreshing ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Filtreler */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Filtreler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zaman Aralığı</label>
                  <select
                    value={filter.timeRange}
                    onChange={(e) => setFilter(prev => ({ ...prev, timeRange: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={6}>Son 6 Saat</option>
                    <option value={12}>Son 12 Saat</option>
                    <option value={24}>Son 24 Saat</option>
                    <option value={48}>Son 48 Saat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Büyüklük</label>
                  <select
                    value={filter.minMagnitude}
                    onChange={(e) => setFilter(prev => ({ ...prev, minMagnitude: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={1.0}>1.0+</option>
                    <option value={2.0}>2.0+</option>
                    <option value={3.0}>3.0+</option>
                    <option value={4.0}>4.0+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maksimum Derinlik (km)</label>
                  <select
                    value={filter.maxDepth === null ? 'all' : filter.maxDepth}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      maxDepth: e.target.value === 'all' ? null : Number(e.target.value) 
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">Tümü</option>
                    <option value={10}>0-10 km</option>
                    <option value={20}>0-20 km</option>
                    <option value={50}>0-50 km</option>
                    <option value={100}>0-100 km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            {stats && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-sm text-blue-600 mb-1">Gösterilen Deprem</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.count}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="text-sm text-green-600 mb-1">Ortalama Büyüklük</div>
                  <div className="text-2xl font-bold text-green-700">{stats.avgMagnitude}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="text-sm text-purple-600 mb-1">Ortalama Derinlik</div>
                  <div className="text-2xl font-bold text-purple-700">{stats.avgDepth} km</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                  <div className="text-sm text-red-600 mb-1">En Büyük Deprem</div>
                  <div className="text-2xl font-bold text-red-700">{stats.maxMagnitude}</div>
                </div>
              </div>
            )}

            {/* Harita */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 h-[600px] rounded-lg overflow-hidden">
                <Map 
                  earthquakes={filteredEarthquakes} 
                  onEarthquakeSelect={setSelectedEarthquake}
                />
              </div>

              {/* Detay Paneli */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedEarthquake ? 'Deprem Detayları' : 'Deprem Seçin'}
                </h3>
                {selectedEarthquake ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Konum</div>
                      <div className="font-medium">{selectedEarthquake.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tarih</div>
                      <div className="font-medium">{selectedEarthquake.date}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Büyüklük</div>
                      <div className="font-medium">{selectedEarthquake.magnitude}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Derinlik</div>
                      <div className="font-medium">{selectedEarthquake.depth} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Koordinatlar</div>
                      <div className="font-medium">
                        {selectedEarthquake.latitude.toFixed(4)}, {selectedEarthquake.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Detayları görüntülemek için haritadan bir deprem seçin.
                  </p>
                )}
              </div>
            </div>

            {/* Lejant */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Büyüklük Skalası</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#32CD32] mr-2"></div>
                  <span className="text-sm text-gray-600">1-3 Büyüklük</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#FFA500] mr-2"></div>
                  <span className="text-sm text-gray-600">3-4 Büyüklük</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#FF6B00] mr-2"></div>
                  <span className="text-sm text-gray-600">4-5 Büyüklük</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#FF0000] mr-2"></div>
                  <span className="text-sm text-gray-600">5+ Büyüklük</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 