'use client';

import { useState, useEffect, useCallback } from 'react';
import EarthquakeList from '@/components/EarthquakeList';
import dynamic from 'next/dynamic';
import { FaMapMarkedAlt, FaChartBar, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';

interface Earthquake {
  id: string;
  date: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
}

interface Stats {
  totalEarthquakes: number;
  strongEarthquakes: number;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lastUpdate: string;
}

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalEarthquakes: 0,
    strongEarthquakes: 0,
    lastDay: 0,
    lastWeek: 0,
    lastMonth: 0,
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const riskyCities = [
    { name: 'İstanbul', risk: 'Çok Yüksek', faultLine: 'Kuzey Anadolu Fayı' },
    { name: 'İzmir', risk: 'Yüksek', faultLine: 'Batı Anadolu Fayı' },
    { name: 'Kahramanmaraş', risk: 'Çok Yüksek', faultLine: 'Doğu Anadolu Fayı' },
    { name: 'Hatay', risk: 'Çok Yüksek', faultLine: 'Doğu Anadolu Fayı' },
    { name: 'Gaziantep', risk: 'Yüksek', faultLine: 'Doğu Anadolu Fayı' }
  ];

  const updateStats = useCallback((earthquakes: Earthquake[]) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      totalEarthquakes: earthquakes.length,
      strongEarthquakes: earthquakes.filter(eq => eq.magnitude >= 4.0).length,
      lastDay: earthquakes.filter(eq => new Date(eq.date) > oneDayAgo).length,
      lastWeek: earthquakes.filter(eq => new Date(eq.date) > oneWeekAgo).length,
      lastMonth: earthquakes.length,
      lastUpdate: new Date().toLocaleString('tr-TR')
    });
    setLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Türkiye Deprem İzleme Sistemi
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Gerçek zamanlı deprem verileri, detaylı analizler ve risk değerlendirmeleri ile
              Türkiye'deki sismik aktiviteleri takip edin.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/harita" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-blue-300">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <FaMapMarkedAlt className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Deprem Haritası</h3>
                  <p className="text-gray-600">İnteraktif harita üzerinde depremleri görüntüleyin</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/istatistikler" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-blue-300">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-500 transition-colors">
                  <FaChartBar className="w-6 h-6 text-green-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">İstatistikler</h3>
                  <p className="text-gray-600">Detaylı analizler ve istatistiksel veriler</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="#risk-cities" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-blue-300">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-500 transition-colors">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Risk Bölgeleri</h3>
                  <p className="text-gray-600">Yüksek riskli bölgeler ve fay hatları</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Toplam Deprem</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">24 Saat</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{stats.totalEarthquakes}</span>
              <span className="ml-2 text-sm text-gray-500">adet</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Güçlü Depremler</h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">4.0+</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{stats.strongEarthquakes}</span>
              <span className="ml-2 text-sm text-gray-500">adet</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Son 24 Saat</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Yeni</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{stats.lastDay}</span>
              <span className="ml-2 text-sm text-gray-500">adet</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Son 7 Gün</h3>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Haftalık</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{stats.lastWeek}</span>
              <span className="ml-2 text-sm text-gray-500">adet</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Son 30 Gün</h3>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Aylık</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{stats.lastMonth}</span>
              <span className="ml-2 text-sm text-gray-500">adet</span>
            </div>
          </div>
        </div>

        {/* Risk Cities Section */}
        <div id="risk-cities" className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Yüksek Riskli Bölgeler</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Aktif fay hatları üzerinde bulunan ve deprem riski yüksek şehirler
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <FaInfoCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskyCities.map((city) => (
                <div 
                  key={city.name}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{city.faultLine}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      city.risk === 'Çok Yüksek' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {city.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earthquake List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Son Depremler</h3>
          </div>
          <div className="p-6">
            <EarthquakeList onDataUpdate={updateStats} />
          </div>
        </div>
      </div>
    </main>
  );
} 