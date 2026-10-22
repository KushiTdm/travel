import { useTranslation } from 'react-i18next';
import { useCurrentLang } from '@/lib/useCurrentLang';
import faq from '@/data/faq';

function Faq() {
  const { t } = useTranslation();
  const lang = useCurrentLang();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-primary-800">{t('faq.title')}</h1>
      <div className="divide-y divide-surface-200 rounded-lg border border-surface-200 bg-white">
        {faq[lang].map((item) => (
          <details key={item.q} className="group px-4 py-3">
            <summary className="cursor-pointer list-none font-medium text-primary-800 marker:hidden">{item.q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-surface-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export default Faq;
