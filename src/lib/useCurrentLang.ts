import { useParams } from 'react-router-dom';
import type { Language } from '@/types/tour';
import { defaultLanguage } from '@/i18n';

export function useCurrentLang(): Language {
  const { lang } = useParams();
  return lang === 'en' || lang === 'fr' ? lang : defaultLanguage;
}
