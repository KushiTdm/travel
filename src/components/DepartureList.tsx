import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDepartures } from '@/lib/useDepartures';
import { useCurrentLang } from '@/lib/useCurrentLang';
import { formatDate } from '@/lib/formatDate';
import StatusBadge from '@/components/StatusBadge';

function DepartureList({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const { departures, loading } = useDepartures(slug);

  if (loading) return <div className="h-24 animate-pulse rounded-lg bg-surface-200" />;
  if (departures.length === 0) return <p className="text-sm text-surface-500">{t('tourDetail.noDepartures')}</p>;

  return (
    <ul className="divide-y divide-surface-200 rounded-lg border border-surface-200 bg-white">
      {departures.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-medium text-primary-800">{formatDate(d.startDate, lang)}</p>
            {d.status !== 'full' && (
              <p className="text-xs text-surface-500">{t('tourDetail.spotsLeft', { count: d.remaining })}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={d.status} />
            {d.status !== 'full' && (
              <Link
                to={`/${lang}/book/${slug}?departure=${d.id}`}
                className="text-sm font-medium text-accent-600 hover:text-accent-700"
              >
                {t('tourDetail.requestTour')}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default DepartureList;
