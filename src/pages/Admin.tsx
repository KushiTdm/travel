import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDemoStore } from '@/store/useDemoStore';
import { INQUIRY_STATUSES, type InquiryStatus } from '@/types/inquiry';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/config';
import { useTours } from '@/lib/useTours';
import { useCurrentLang } from '@/lib/useCurrentLang';
import Field, { inputClass } from '@/components/Field';

function Login() {
  const { t } = useTranslation();
  const login = useDemoStore((s) => s.login);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [failed, setFailed] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setFailed(!login(email, password));
      }}
      className="mx-auto max-w-sm space-y-4 rounded-lg border border-surface-200 bg-white p-6"
    >
      <h1 className="text-2xl font-bold text-primary-800">{t('admin.loginTitle')}</h1>
      <p className="text-sm text-surface-500">{t('admin.loginHint')}</p>
      <Field label={t('book.email')}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </Field>
      <Field label={t('admin.password')}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </Field>
      {failed && <p className="text-sm text-error-600">{t('admin.invalid')}</p>}
      <button type="submit" className="w-full rounded-lg bg-accent-600 py-2.5 font-medium text-white hover:bg-accent-700">
        {t('admin.enter')}
      </button>
    </form>
  );
}

function Dashboard() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const { tours } = useTours();
  const inquiries = useDemoStore((s) => s.inquiries);
  const fresh = useDemoStore((s) => s.freshReferences);
  const setStatus = useDemoStore((s) => s.setStatus);
  const clearFresh = useDemoStore((s) => s.clearFresh);
  const logout = useDemoStore((s) => s.logout);
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');

  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const rows = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);
  const tourTitle = (slug: string | null) =>
    slug ? (tours.find((x) => x.slug === slug)?.translations[lang].title ?? slug) : '—';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-primary-800">{t('admin.title')}</h1>
        <button onClick={logout} className="rounded-lg border border-surface-300 px-3 py-1.5 text-sm hover:bg-surface-100">
          {t('admin.logout')}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="rounded-lg border border-surface-200 bg-white px-5 py-3">
          <p className="text-xs text-surface-500">{t('admin.newCount')}</p>
          <p className="text-3xl font-bold text-accent-600" aria-live="polite">{newCount}</p>
        </div>
        <div className="rounded-lg border border-surface-200 bg-white px-5 py-3">
          <p className="text-xs text-surface-500">{t('admin.total')}</p>
          <p className="text-3xl font-bold text-primary-800">{inquiries.length}</p>
        </div>
        <Field label={t('admin.filter')}>
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | InquiryStatus)} className={inputClass}>
            <option value="all">{t('admin.allStatuses')}</option>
            {INQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`admin.statuses.${s}`)}</option>
            ))}
          </select>
        </Field>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-surface-300 p-8 text-center text-surface-500">{t('admin.empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-surface-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-100 text-xs uppercase text-surface-500">
              <tr>
                {['reference', 'date', 'source', 'tour', 'contact', 'travellers', 'statusCol'].map((c) => (
                  <th key={c} className="px-3 py-2 font-medium">{t(`admin.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {rows.map((i) => (
                <tr key={i.reference} className={fresh.includes(i.reference) ? 'bg-accent-50' : ''}>
                  <td className="whitespace-nowrap px-3 py-2 font-mono">
                    {i.reference}
                    {fresh.includes(i.reference) && (
                      <span className="ml-2 animate-pulse rounded-full bg-accent-600 px-2 py-0.5 text-xs font-semibold text-white">
                        {t('admin.badgeNew')}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{new Date(i.createdAt).toLocaleString(lang)}</td>
                  <td className="px-3 py-2">{t(`admin.sources.${i.source}`)}</td>
                  <td className="px-3 py-2">{tourTitle(i.tourSlug)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{i.data.name}</div>
                    <div className="text-xs text-surface-500">{i.data.email}</div>
                    {i.source === 'tailor_made' && (
                      <div className="mt-1 text-xs text-surface-500">
                        {[i.data.destinations?.join(', '), i.data.period, i.data.duration && `${i.data.duration} j`, i.data.budget && `${i.data.budget} €`].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">{i.data.adults != null ? `${i.data.adults} + ${i.data.children ?? 0}` : '—'}</td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={t('admin.statusCol')}
                      value={i.status}
                      onChange={(e) => {
                        setStatus(i.reference, e.target.value as InquiryStatus);
                        clearFresh(i.reference);
                      }}
                      className="rounded-md border border-surface-300 bg-white px-2 py-1 text-sm"
                    >
                      {INQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`admin.statuses.${s}`)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Admin() {
  const session = useDemoStore((s) => s.adminSession);
  return session ? <Dashboard /> : <Login />;
}

export default Admin;
