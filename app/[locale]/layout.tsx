import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { createTranslator } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Providers } from './providers';
import { getMessages } from '../i18n';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TunDeprem',
  description: 'Türkiye Deprem İzleme Sistemi',
};

const locales = ['tr', 'en', 'ru', 'ar'];

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages(locale);
  const t = createTranslator({ locale, messages });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <Providers locale={locale} messages={messages}>
          <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href={`/${locale}`} className="flex items-center">
                    <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="ml-2 text-xl font-bold text-gray-900">TunDeprem</span>
                  </Link>
                  <div className="ml-10 flex items-center justify-between flex-grow">
                    <div className="flex space-x-8">
                      <Link href={`/${locale}`} className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
                        {t('navigation.home')}
                      </Link>
                      <Link href={`/${locale}/harita`} className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
                        {t('navigation.map')}
                      </Link>
                      <Link href={`/${locale}/istatistikler`} className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
                        {t('navigation.statistics')}
                      </Link>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <p className="text-base font-arabic text-gray-800">{t('verse.arabic')}</p>
                      <p className="text-xs italic text-gray-600">{t('verse.translation')}</p>
                      <p className="text-[10px] text-gray-400">{t('verse.source')}</p>
                    </div>
                    <div className="flex space-x-4 ml-8">
                      {locales.map((loc) => (
                        <Link
                          key={loc}
                          href={`/${loc}`}
                          className={`text-sm ${locale === loc ? 'text-red-500 font-bold' : 'text-gray-500'}`}
                        >
                          {loc.toUpperCase()}
                        </Link>
                      ))}
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
                  {t('footer.rights')}
                </p>
                <div className="flex space-x-6">
                  <Link href={`/${locale}/gizlilik`} className="text-gray-400 hover:text-gray-500">
                    {t('footer.privacy')}
                  </Link>
                  <Link href={`/${locale}/kullanim-sartlari`} className="text-gray-400 hover:text-gray-500">
                    {t('footer.terms')}
                  </Link>
                  <Link href={`/${locale}/iletisim`} className="text-gray-400 hover:text-gray-500">
                    {t('footer.contact')}
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
} 