import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TRAVEL_STYLES } from '@/types/tour';
import { useCurrentLang } from '@/lib/useCurrentLang';
import { useTours } from '@/lib/useTours';
import Hero from '@/components/Hero';
import TourCard from '@/components/TourCard';

interface Point {
  t: string;
  d: string;
}

function PointList({ title, points, images, scene }: { title: string; points: Point[]; images: string[]; scene?: boolean }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold text-primary-800 mb-4">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {points.map((p, i) => (
          <div key={p.t} className="rounded-lg border border-surface-200 bg-white p-4">
            <img src={images[i]} alt="" loading="lazy" className={scene ? 'mb-3 h-28 w-28 object-contain' : 'mb-3 h-16 w-16 object-contain'} />
            <h3 className="font-semibold text-primary-800">{p.t}</h3>
            <p className="mt-1 text-sm text-surface-600">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const { tours } = useTours();

  return (
    <div>
      <Hero />

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-primary-800 mb-4">{t('home.featured')}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.slice(0, 3).map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-2xl font-bold text-primary-800">{t('home.stylesTitle')}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {TRAVEL_STYLES.map((st) => (
            <Link
              key={st}
              to={`/${lang}/tours?style=${st}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 bg-white p-4 text-center text-sm font-medium text-primary-800 transition-shadow hover:shadow-md"
            >
              <img src={`/images/icons/${st}.webp`} alt="" loading="lazy" className="h-14 w-14 object-contain" />
              {t(`styles.${st}`)}
            </Link>
          ))}
        </div>
      </section>

      <PointList title={t('home.whyTitle')} points={t('home.why', { returnObjects: true }) as Point[]} images={['small-groups', 'local-guides', 'human-reply'].map((n) => `/images/icons/${n}.webp`)} />
      <PointList title={t('home.forWhoTitle')} points={t('home.forWho', { returnObjects: true }) as Point[]} images={['couples', 'families', 'independent'].map((n) => `/images/scenes/${n}.webp`)} scene />
    </div>
  );
}

export default Home;
