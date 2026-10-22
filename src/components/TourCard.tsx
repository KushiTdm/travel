import { Link } from 'react-router-dom';
import { Clock, Gauge, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tour } from '@/types/tour';
import { useCurrentLang } from '@/lib/useCurrentLang';
import Cover from '@/components/CoverPlaceholder';

function TourCard({ tour }: { tour: Tour }) {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const tr = tour.translations[lang];

  return (
    <Link
      to={`/${lang}/tours/${tour.slug}`}
      className="group block rounded-lg overflow-hidden bg-white border border-surface-200 hover:shadow-md transition-shadow"
    >
      <div className="aspect-[16/10] overflow-hidden bg-surface-100">
        <Cover tour={tour} alt={tr.title} className="group-hover:scale-[1.03] transition-transform duration-300" />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-surface-500">
          {tour.countries.map((c) => t(`countries.${c}`)).join(' · ')}
        </p>
        <h3 className="mt-1 font-semibold text-primary-800 group-hover:text-accent-600 transition-colors">
          {tr.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-surface-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {t('tours.durationDays', { count: tour.durationDays })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            {t(`tours.difficulties.${tour.difficulty}`)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-4 h-4" />
            {tour.groupMax}
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm text-surface-500">{t('tours.from')}</span>
          <span className="text-lg font-bold text-accent-600">{tour.priceFromEur} €</span>
        </div>
      </div>
    </Link>
  );
}

export default TourCard;
