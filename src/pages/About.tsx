import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  const principles = t('about.responsible', { returnObjects: true }) as string[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-primary-800">{t('about.title')}</h1>
      <img src="/images/about.webp" alt={t('about.imageAlt')} loading="lazy" className="aspect-[16/9] w-full rounded-lg object-cover" />
      <p className="leading-relaxed text-surface-600">{t('about.p1')}</p>
      <p className="leading-relaxed text-surface-600">{t('about.p2')}</p>
      <section>
        <h2 className="mb-2 text-xl font-semibold text-primary-800">{t('about.responsibleTitle')}</h2>
        <ul className="list-disc space-y-1 pl-5 text-surface-600">
          {principles.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold text-primary-800">{t('about.legalTitle')}</h2>
        <p className="text-sm leading-relaxed text-surface-600">{t('about.legal')}</p>
      </section>
    </div>
  );
}

export default About;
