'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { Earthquake } from '../types/types'
import { useTranslations } from 'next-intl'

interface EarthquakeListProps {
  onDataUpdate?: (data: Earthquake[]) => void;
}

const EarthquakeList: React.FC<EarthquakeListProps> = ({ onDataUpdate }) => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)

  const t = useTranslations('earthquakes');

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateLastUpdateTime = useCallback(() => {
    if (!mounted) return;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    setLastUpdate(`${hours}:${minutes}:${seconds}`);
  }, [mounted]);

  const formatDate = useCallback((dateString: string) => {
    if (!mounted) return dateString;
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [mounted]);

  const fetchEarthquakes = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live');
      
      if (!response.ok) {
        throw new Error(t('error'));
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error(t('error'));
      }

      const formattedData: Earthquake[] = data.result
        .filter((item: any) => {
          const isValid = 
            item &&
            typeof item.earthquake_id === 'string' &&
            typeof item.date === 'string' &&
            !isNaN(Number(item.geojson.coordinates[1])) &&
            !isNaN(Number(item.geojson.coordinates[0])) &&
            !isNaN(Number(item.depth)) &&
            !isNaN(Number(item.magnitude)) &&
            typeof item.title === 'string';

          if (!isValid) {
            console.warn('Geçersiz deprem verisi:', item);
          }
          return isValid;
        })
        .map((item: any) => ({
          id: item.earthquake_id,
          date: formatDate(item.date),
          latitude: Number(item.geojson.coordinates[1]),
          longitude: Number(item.geojson.coordinates[0]),
          depth: Number(item.depth),
          magnitude: Number(item.magnitude),
          location: item.title,
        }));

      if (formattedData.length === 0) {
        throw new Error(t('error'));
      }

      setEarthquakes(formattedData);
      if (onDataUpdate) {
        onDataUpdate(formattedData);
      }
      updateLastUpdateTime();
      
    } catch (err) {
      console.error('Deprem verisi alınırken hata:', err);
      setError(t('error'));
      setEarthquakes([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [onDataUpdate, updateLastUpdateTime, formatDate, t]);

  useEffect(() => {
    if (mounted) {
      fetchEarthquakes();
      const interval = setInterval(() => fetchEarthquakes(true), 60000);
      return () => clearInterval(interval);
    }
  }, [fetchEarthquakes, mounted]);

  const getMagnitudeColor = useCallback((magnitude: number) => {
    if (magnitude >= 5) return 'bg-red-600 text-white';
    if (magnitude >= 4) return 'bg-orange-500 text-white';
    if (magnitude >= 3) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 mb-2">{t('error')}</p>
          <button
            onClick={() => fetchEarthquakes(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <div className="flex items-center">
          {lastUpdate && (
            <span className="text-sm text-gray-500 mr-4">
              {t('lastUpdate')}: {lastUpdate}
            </span>
          )}
          <button
            onClick={() => fetchEarthquakes(true)}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {earthquakes.map((earthquake) => (
          <div
            key={earthquake.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{earthquake.location}</h3>
                <p className="text-gray-600 text-sm">{earthquake.date}</p>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMagnitudeColor(earthquake.magnitude)}`}>
                  {earthquake.magnitude.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>{t('depth')}: {earthquake.depth} {t('km')}</p>
              <p>{t('coordinates')}: {earthquake.latitude.toFixed(4)}, {earthquake.longitude.toFixed(4)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EarthquakeList; 