import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Moon } from 'lucide-react';
import type { ItineraryDay, Language } from '@/types/tour';

function ItineraryAccordion({ days, lang }: { days: ItineraryDay[]; lang: Language }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(days[0]?.day ?? null);

  return (
    <div className="divide-y divide-surface-200 rounded-lg border border-surface-200 bg-white">
      {days.map((d) => {
        const isOpen = open === d.day;
        const tr = d.translations[lang];
        return (
          <div key={d.day}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`day-${d.day}`}
              onClick={() => setOpen(isOpen ? null : d.day)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-50"
            >
              <span>
                <span className="block text-xs font-semibold uppercase text-accent-600">
                  {t('tourDetail.day', { count: d.day })}
                </span>
                <span className="font-medium text-primary-800">{tr.title}</span>
              </span>
              <ChevronDown className={`w-5 h-5 shrink-0 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div id={`day-${d.day}`} className="px-4 pb-4 text-sm text-surface-600 leading-relaxed">
                <p>{tr.description}</p>
                {d.overnightLocation && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-surface-500">
                    <Moon className="w-4 h-4" />
                    {t('tourDetail.overnight')}: {d.overnightLocation[lang]}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ItineraryAccordion;
