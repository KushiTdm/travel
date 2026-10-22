import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, FileText } from 'lucide-react';
import destinations from '@/data/destinations';
import { useTours } from '@/lib/useTours';
import { useCurrentLang } from '@/lib/useCurrentLang';
import TourCard from '@/components/TourCard';

function Destination() {
  const { t } = useTranslation();
  const { country } = useParams();
  const lang = useCurrentLang();
  const { tours } = useTours();
  const dest = destinations.find((d) => d.country === country);

  if (!dest) return <Navigate to={`/${lang}/destinations`} replace />;
  const tr = dest.translations[lang];
  const matching = tours.filter((x) => x.countries.includes(dest.country));

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl bg-primary-800 px-6 py-14 text-white sm:px-10 sm:py-20">
        <img src={dest.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="relative">
          <p className="text-sm uppercase tracking-wide text-white/80">{t(`countries.${dest.country}`)}</p>
          <h1 className="mt-1 max-w-2xl text-3xl font-bold">{tr.tagline}</h1>
          <p className="mt-4 max-w-2xl text-white/90">{tr.intro}</p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-primary-800">{t('destinations.highlights')}</h2>
          <ul className="list-disc space-y-1 pl-5 text-surface-600">
            {dest.highlights[lang].map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
        <section className="space-y-4 text-sm text-surface-600">
          <p className="flex gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />{tr.bestSeason}</p>
          <p className="flex gap-2"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />{tr.practical}</p>
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-primary-800">{t('destinations.toursIn', { country: t(`countries.${dest.country}`) })}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matching.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      </section>

      <div className="rounded-lg border border-surface-200 bg-white p-6 text-center">
        <p className="text-surface-600">{t('destinations.ctaText')}</p>
        <Link to={`/${lang}/plan?destination=${dest.country}`} className="mt-3 inline-block rounded-lg bg-accent-600 px-5 py-2.5 font-medium text-white hover:bg-accent-700">
          {t('nav.plan')}
        </Link>
      </div>
    </div>
  );
}

export default Destination;
