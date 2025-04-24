'use client';

import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EarthquakeStats {
  magnitudeDistribution: { [key: string]: number };
  depthDistribution: { [key: string]: number };
  hourlyDistribution: { [key: string]: number };
  locationDistribution: { [key: string]: number };
  totalCount: number;
  averageMagnitude: number;
  averageDepth: number;
  maxMagnitude: number;
  lastUpdate: string;
}

interface FilterOptions {
  days: number;
  minMagnitude: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<EarthquakeStats>({
    magnitudeDistribution: {},
    depthDistribution: {},
    hourlyDistribution: {},
    locationDistribution: {},
    totalCount: 0,
    averageMagnitude: 0,
    averageDepth: 0,
    maxMagnitude: 0,
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOptions>({
    days: 7,
    minMagnitude: 1.0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
        new URLSearchParams({
          format: 'geojson',
          starttime: new Date(Date.now() - filter.days * 24 * 60 * 60 * 1000).toISOString(),
          endtime: new Date().toISOString(),
          minlatitude: '30',
          maxlatitude: '45',
          minlongitude: '25',
          maxlongitude: '45',
          minmagnitude: filter.minMagnitude.toString()
        })
      );

      const data = await response.json();
      const features = data.features;

      const magnitudeDist: { [key: string]: number } = {};
      const depthDist: { [key: string]: number } = {};
      const hourlyDist: { [key: string]: number } = {};
      const locationDist: { [key: string]: number } = {};
      let totalMag = 0;
      let totalDepth = 0;
      let maxMag = 0;

      features.forEach((quake: any) => {
        // Büyüklük dağılımı
        const mag = Math.floor(quake.properties.mag * 10) / 10;
        magnitudeDist[mag] = (magnitudeDist[mag] || 0) + 1;
        totalMag += quake.properties.mag;
        maxMag = Math.max(maxMag, quake.properties.mag);

        // Derinlik dağılımı
        const depth = Math.floor(quake.geometry.coordinates[2] / 10) * 10;
        depthDist[depth] = (depthDist[depth] || 0) + 1;
        totalDepth += quake.geometry.coordinates[2];

        // Saatlik dağılım
        const hour = new Date(quake.properties.time).getHours();
        hourlyDist[hour] = (hourlyDist[hour] || 0) + 1;

        // Lokasyon dağılımı
        const location = quake.properties.place?.split(',').pop()?.trim() || 'Bilinmiyor';
        locationDist[location] = (locationDist[location] || 0) + 1;
      });

      setStats({
        magnitudeDistribution: magnitudeDist,
        depthDistribution: depthDist,
        hourlyDistribution: hourlyDist,
        locationDistribution: locationDist,
        totalCount: features.length,
        averageMagnitude: totalMag / features.length,
        averageDepth: totalDepth / features.length,
        maxMagnitude: maxMag,
        lastUpdate: new Date().toLocaleString('tr-TR')
      });
    } catch (error) {
      console.error('Veriler alınamadı:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const magnitudeChartData = {
    labels: Object.keys(stats.magnitudeDistribution).sort((a, b) => Number(a) - Number(b)),
    datasets: [
      {
        label: 'Deprem Sayısı',
        data: Object.keys(stats.magnitudeDistribution)
          .sort((a, b) => Number(a) - Number(b))
          .map(key => stats.magnitudeDistribution[key]),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Saatlik Deprem Dağılımı',
        data: Array.from({ length: 24 }, (_, i) => stats.hourlyDistribution[i] || 0),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)'
      }
    ]
  };

  const depthChartData = {
    labels: Object.keys(stats.depthDistribution).sort((a, b) => Number(a) - Number(b)),
    datasets: [
      {
        label: 'Derinlik Dağılımı',
        data: Object.keys(stats.depthDistribution)
          .sort((a, b) => Number(a) - Number(b))
          .map(key => stats.depthDistribution[key]),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
      },
    ],
  };

  const locationChartData = {
    labels: Object.keys(stats.locationDistribution).slice(0, 5),
    datasets: [
      {
        data: Object.values(stats.locationDistribution).slice(0, 5),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">İstatistikler yükleniyor...</p>
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
                <h1 className="text-2xl font-bold text-white">Deprem İstatistikleri</h1>
                <p className="text-blue-100 mt-1">Son güncelleme: {stats.lastUpdate}</p>
              </div>
              <button
                onClick={fetchData}
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
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Filtreler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zaman Aralığı</label>
                  <select
                    value={filter.days}
                    onChange={(e) => setFilter(prev => ({ ...prev, days: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={1}>Son 24 Saat</option>
                    <option value={7}>Son 7 Gün</option>
                    <option value={30}>Son 30 Gün</option>
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
              </div>
            </div>

            {/* Özet İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="text-sm text-blue-600 mb-1">Toplam Deprem</div>
                <div className="text-3xl font-bold text-blue-700">{stats.totalCount}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="text-sm text-green-600 mb-1">Ortalama Büyüklük</div>
                <div className="text-3xl font-bold text-green-700">
                  {stats.averageMagnitude.toFixed(1)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="text-sm text-purple-600 mb-1">Ortalama Derinlik</div>
                <div className="text-3xl font-bold text-purple-700">
                  {stats.averageDepth.toFixed(1)} km
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <div className="text-sm text-red-600 mb-1">En Büyük Deprem</div>
                <div className="text-3xl font-bold text-red-700">
                  {stats.maxMagnitude.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Büyüklük Dağılımı</h3>
                <Line
                  data={magnitudeChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Deprem Sayısı'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Büyüklük'
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Saatlik Dağılım</h3>
                <Bar
                  data={hourlyChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Deprem Sayısı'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Saat'
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Derinlik Dağılımı</h3>
                <Bar
                  data={depthChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Deprem Sayısı'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Derinlik (km)'
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">En Çok Deprem Olan 5 Bölge</h3>
                <Doughnut
                  data={locationChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 