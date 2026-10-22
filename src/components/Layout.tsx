import { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages, defaultLanguage, type Language } from '@/i18n';
import { startCrossTabSync } from '@/store/useDemoStore';
import { startSmoothScroll } from '@/lib/smoothScroll';
import SiteHeader from '@/components/SiteHeader';

function buildPath(lang: Language, pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && languages.includes(segments[0] as Language)) {
    segments[0] = lang;
  } else {
    segments.unshift(lang);
  }
  return '/' + segments.join('/');
}

function Layout() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = (languages.includes(lang as Language) ? lang : defaultLanguage) as Language;
  const isHome = /^\/(fr|en)\/?$/.test(location.pathname);

  if (i18n.language !== currentLang) {
    i18n.changeLanguage(currentLang);
  }

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  useEffect(() => startCrossTabSync(), []);
  useEffect(() => startSmoothScroll(), []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-surface-50 text-surface-800">
      <SiteHeader lang={currentLang} isHome={isHome} onLangChange={(l) => navigate(buildPath(l, location.pathname))} />

      <main className={`mx-auto w-full max-w-6xl flex-1 px-4 pb-8 ${isHome ? 'pt-0' : 'pt-36'}`}>
        <Outlet />
      </main>

      <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-surface-500 space-y-1">
          <p>{t('footer.tagline')}</p>
          <p>{t('footer.demoNote')}</p>
          <p>
            {t('footer.siteBy')}{' '}
            <a
              href="https://neuraweb.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:text-accent-700"
            >
              NeuraWeb
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
