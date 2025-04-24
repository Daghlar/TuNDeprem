import EarthquakeList from '../components/EarthquakeList';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>
        <EarthquakeList />
      </div>
    </main>
  );
} 