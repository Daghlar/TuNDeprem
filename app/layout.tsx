import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TunDeprem',
  description: 'Türkiye Deprem İzleme Sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900">TunDeprem</span>
                </Link>
                <div className="ml-10 flex items-center justify-between flex-grow">
                  <div className="flex space-x-8">
                    <Link href="/" className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
                      Ana Sayfa
                    </Link>
                    <Link href="/harita" className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
                      Harita
                    </Link>
                    <Link href="/istatistikler" className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
                      İstatistikler
                    </Link>
                  </div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <p className="text-base font-arabic text-gray-800">حَتّٰٓى اَتٰينَا الْيَق۪ينُۜ</p>
                    <p className="text-xs italic text-gray-600">"Böyle gaflet içinde yaşayıp giderken kaçınılması mümkün olmayan ölüm gerçeği geldi çattı."</p>
                    <p className="text-[10px] text-gray-400">Müddessir / 47. Ayet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2024 TunDeprem. Tüm hakları saklıdır.
              </p>
              <div className="flex space-x-6">
                <Link href="/gizlilik" className="text-gray-400 hover:text-gray-500">
                  Gizlilik Politikası
                </Link>
                <Link href="/kullanim-sartlari" className="text-gray-400 hover:text-gray-500">
                  Kullanım Şartları
                </Link>
                <Link href="/iletisim" className="text-gray-400 hover:text-gray-500">
                  İletişim
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 