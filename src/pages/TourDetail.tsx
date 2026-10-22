import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Gauge, Users, Route, Check, X, ArrowLeft } from 'lucide-react';
import { useTour } from '@/lib/useTours';
import { useCurrentLang } from '@/lib/useCurrentLang';
import Cover from '@/components/CoverPlaceholder';
import ItineraryAccordion from '@/components/ItineraryAccordion';
import DepartureList from '@/components/DepartureList';
import WeatherWidget from '@/components/WeatherWidget';

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-surface-200 py-3">
      <span className="inline-flex items-center gap-2 text-sm text-surface-500">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-surface-800">{value}</span>
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-surface-700">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function TourDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const lang = useCurrentLang();
  const { tour, loading } = useTour(slug);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-8 w-2/3 rounded bg-surface-200" />
        <div className="mb-6 h-64 w-full rounded-lg bg-surface-200" />
        <div className="h-40 w-full rounded bg-surface-200" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-primary-800">{t('tourDetail.notFound')}</h1>
        <p className="mt-2 text-surface-500">{t('tourDetail.notFoundDesc')}</p>
        <Link to={`/${lang}/tours`} className="mt-6 inline-flex items-center gap-2 font-medium text-accent-600 hover:text-accent-700">
          <ArrowLeft className="h-4 w-4" />
          {t('tourDetail.backToTours')}
        </Link>
      </div>
    );
  }

  const tr = tour.translations[lang];

  return (
    <div>
      <Link to={`/${lang}/tours`} className="mb-4 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-accent-600">
        <ArrowLeft className="h-4 w-4" />
        {t('tourDetail.backToTours')}
      </Link>

      <div className="mb-6 aspect-[21/9] overflow-hidden rounded-lg bg-surface-100">
        <Cover tour={tour} alt={tr.title} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <h1 className="text-3xl font-bold text-primary-800">{tr.title}</h1>
            <p className="mt-4 leading-relaxed text-surface-600">{tr.summary}</p>
          </div>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-primary-800">{t('tourDetail.itinerary')}</h2>
            <ItineraryAccordion days={tour.itinerary} lang={lang} />
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-primary-800">{t('tourDetail.departures')}</h2>
            <DepartureList slug={tour.slug} />
          </section>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-primary-800">
                <Check className="h-5 w-5 text-success-500" />
                {t('tourDetail.inclusions')}
              </h2>
              <BulletList items={tr.inclusions} color="bg-success-500" />
            </div>
            <div>
              <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-primary-800">
                <X className="h-5 w-5 text-error-500" />
                {t('tourDetail.exclusions')}
              </h2>
              <BulletList items={tr.exclusions} color="bg-error-500" />
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <div className="rounded-lg border border-surface-200 bg-white p-5">
              <FactRow icon={<Clock className="h-4 w-4" />} label={t('tourDetail.duration')} value={t('tours.durationDays', { count: tour.durationDays })} />
              <FactRow icon={<Gauge className="h-4 w-4" />} label={t('tourDetail.difficulty')} value={t(`tours.difficulties.${tour.difficulty}`)} />
              <FactRow icon={<Users className="h-4 w-4" />} label={t('tourDetail.group')} value={t('tourDetail.groupValue', { count: tour.groupMax })} />
              <FactRow icon={<Route className="h-4 w-4" />} label={t('tourDetail.route')} value={`${tour.startCity} → ${tour.endCity}`} />
              <div className="py-4">
                <span className="text-sm text-surface-500">{t('tourDetail.priceFrom')}</span>
                <div className="mt-1 text-2xl font-bold text-accent-600">{tour.priceFromEur} €</div>
                <p className="mt-1 text-xs text-surface-500">{t('tourDetail.priceNote')}</p>
              </div>
              <Link
                to={`/${lang}/book/${tour.slug}`}
                className="block w-full rounded-lg bg-accent-600 py-3 text-center font-medium text-white transition-colors hover:bg-accent-700"
              >
                {t('tourDetail.requestTour')}
              </Link>
            </div>
            <WeatherWidget {...tour.weather} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TourDetail;
