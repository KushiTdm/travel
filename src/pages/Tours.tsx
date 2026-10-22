import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTours } from '@/lib/useTours';
import TourCard from '@/components/TourCard';
import { TRAVEL_STYLES, type Country, type Difficulty, type TravelStyle } from '@/types/tour';

const countries: Country[] = ['vietnam', 'cambodia', 'laos'];
const difficulties: Difficulty[] = ['easy', 'moderate', 'demanding'];

function TourCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-white border border-surface-200 animate-pulse">
      <div className="aspect-[16/10] bg-surface-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-surface-200 rounded" />
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-surface-200 rounded" />
          <div className="h-4 w-24 bg-surface-200 rounded" />
        </div>
        <div className="h-6 w-24 bg-surface-200 rounded" />
      </div>
    </div>
  );
}

function Tours() {
  const { t } = useTranslation();
  const { tours, loading, error } = useTours();
  const [searchParams, setSearchParams] = useSearchParams();

  const countryFilter = searchParams.get('country') ?? 'all';
  const styleFilter = searchParams.get('style') ?? 'all';
  const difficultyFilter = searchParams.get('difficulty') ?? 'all';

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (countryFilter !== 'all' && !tour.countries.includes(countryFilter as Country)) return false;
      if (styleFilter !== 'all' && !tour.styles.includes(styleFilter as TravelStyle)) return false;
      if (difficultyFilter !== 'all' && tour.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [tours, countryFilter, styleFilter, difficultyFilter]);

  const selectClass =
    'text-sm border border-surface-300 rounded-md px-3 py-2 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-accent-500';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-800">{t('tours.title')}</h1>
        <p className="mt-1 text-surface-500">{t('tours.subtitle')}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500">{t('tours.country')}</label>
          <select
            value={countryFilter}
            onChange={(e) => updateFilter('country', e.target.value)}
            className={selectClass}
          >
            <option value="all">{t('tours.all')}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {t(`countries.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500">{t('tours.style')}</label>
          <select
            value={styleFilter}
            onChange={(e) => updateFilter('style', e.target.value)}
            className={selectClass}
          >
            <option value="all">{t('tours.all')}</option>
            {TRAVEL_STYLES.map((st) => (
              <option key={st} value={st}>
                {t(`styles.${st}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500">{t('tours.difficulty')}</label>
          <select
            value={difficultyFilter}
            onChange={(e) => updateFilter('difficulty', e.target.value)}
            className={selectClass}
          >
            <option value="all">{t('tours.all')}</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {t(`tours.difficulties.${d}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="py-12 text-center text-error-500">{t('tours.error')}</p>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && filteredTours.length === 0 && (
        <p className="py-12 text-center text-surface-500">{t('tours.empty')}</p>
      )}

      {!loading && !error && filteredTours.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Tours;
