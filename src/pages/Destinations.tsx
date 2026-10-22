import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import destinations from '@/data/destinations';
import { useCurrentLang } from '@/lib/useCurrentLang';

function Destinations() {
  const { t } = useTranslation();
  const lang = useCurrentLang();

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-800">{t('destinations.title')}</h1>
      <p className="mt-1 text-surface-500">{t('destinations.subtitle')}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {destinations.map((d) => (
          <Link
            key={d.country}
            to={`/${lang}/destinations/${d.country}`}
            className="group overflow-hidden rounded-lg border border-surface-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="aspect-[16/10] overflow-hidden bg-surface-100">
              <img src={d.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold text-primary-800">{t(`countries.${d.country}`)}</h2>
              <p className="mt-2 text-sm text-surface-600">{d.translations[lang].tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Destinations;
