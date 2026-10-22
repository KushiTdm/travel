import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitInquiry } from '@/store/useDemoStore';
import { WHATSAPP_NUMBER } from '@/config';
import { TRAVEL_STYLES, type Country } from '@/types/tour';
import type { Inquiry } from '@/types/inquiry';
import { useCurrentLang } from '@/lib/useCurrentLang';
import Field, { inputClass } from '@/components/Field';

const COUNTRIES: Country[] = ['vietnam', 'cambodia', 'laos'];
const DURATIONS = ['3-5', '6-9', '10-14', '15+'];
const BUDGETS = ['<1000', '1000-2000', '2000-3500', '3500+'];

type Values = {
  destinations: string[];
  styles: string[];
  period: string;
  duration: string;
  adults: number;
  children: number;
  budget: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
};

function Plan() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const [params] = useSearchParams();
  const [done, setDone] = useState<Inquiry | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        destinations: z.array(z.string()).min(1, t('plan.errors.destinations')),
        styles: z.array(z.string()),
        period: z.string().trim().min(2, t('plan.errors.period')),
        duration: z.string().min(1, t('plan.errors.duration')),
        adults: z.number({ error: t('book.errors.adults') }).int().min(1, t('book.errors.adults')).max(12),
        children: z.number({ error: t('book.errors.adults') }).int().min(0).max(8),
        budget: z.string(),
        name: z.string().trim().min(2, t('book.errors.name')),
        email: z.email(t('book.errors.email')),
        phone: z.string().trim().refine((v) => v === '' || /^\+?[\d\s().-]{7,}$/.test(v), t('book.errors.phone')),
        country: z.string().trim(),
        message: z.string().max(1500),
      }),
    [t],
  );

  const initialDest = params.get('destination');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      destinations: initialDest ? [initialDest] : [],
      styles: [],
      period: '',
      duration: '',
      adults: 2,
      children: 0,
      budget: '',
      name: '',
      email: '',
      phone: '',
      country: '',
      message: '',
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    setDone(
      await submitInquiry({
        source: 'tailor_made',
        tourSlug: null,
        data: {
          name: v.name,
          email: v.email,
          phone: v.phone,
          country: v.country,
          message: v.message,
          adults: v.adults,
          children: v.children,
          destinations: v.destinations,
          styles: v.styles,
          period: v.period,
          duration: v.duration,
          budget: v.budget,
        },
      }),
    );
  });

  if (done) {
    const text = encodeURIComponent(t('book.whatsappText', { reference: done.reference }));
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-surface-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-primary-800">{t('plan.sentTitle')}</h1>
        <p className="mt-3 text-surface-600">{t('book.confirmText')}</p>
        <p className="mt-1 font-mono text-2xl font-bold text-accent-600">{done.reference}</p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg bg-success-600 px-6 py-3 font-medium text-white hover:bg-success-700"
        >
          {t('book.whatsapp')}
        </a>
        <p className="mt-3 text-xs text-surface-500">{t('book.confirmDemo')}</p>
        <Link to={`/${lang}`} className="mt-6 inline-block text-sm text-accent-600 hover:text-accent-700">
          {t('book.backHome')}
        </Link>
      </div>
    );
  }

  const chip = 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-surface-300 bg-white px-3 py-1.5 text-sm hover:border-accent-500';

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-primary-800">{t('plan.title')}</h1>
      <p className="mt-2 text-surface-600">{t('plan.subtitle')}</p>
      <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('book.demoNote')}</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6 rounded-lg border border-surface-200 bg-white p-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-surface-700">{t('plan.destinations')}</legend>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <label key={c} className={chip}>
                <input type="checkbox" value={c} {...register('destinations')} />
                {t(`countries.${c}`)}
              </label>
            ))}
          </div>
          {errors.destinations && <p className="mt-1 text-xs text-error-600">{errors.destinations.message}</p>}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-surface-700">{t('plan.styles')}</legend>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <label key={s} className={chip}>
                <input type="checkbox" value={s} {...register('styles')} />
                <img src={`/images/icons/${s}.webp`} alt="" className="h-6 w-6 object-contain" />
                {t(`styles.${s}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('plan.period')} error={errors.period?.message}>
            <input placeholder={t('plan.periodPlaceholder')} className={inputClass} {...register('period')} />
          </Field>
          <Field label={t('plan.duration')} error={errors.duration?.message}>
            <select className={inputClass} {...register('duration')}>
              <option value="">—</option>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{t('plan.durationValue', { range: d })}</option>
              ))}
            </select>
          </Field>
          <Field label={t('book.adults')} error={errors.adults?.message}>
            <input type="number" min={1} max={12} className={inputClass} {...register('adults', { valueAsNumber: true })} />
          </Field>
          <Field label={t('book.children')} error={errors.children?.message}>
            <input type="number" min={0} max={8} className={inputClass} {...register('children', { valueAsNumber: true })} />
          </Field>
          <Field label={t('plan.budget')}>
            <select className={inputClass} {...register('budget')}>
              <option value="">—</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>{b} €</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 border-t border-surface-200 pt-6 sm:grid-cols-2">
          <Field label={t('book.name')} error={errors.name?.message}>
            <input autoComplete="name" className={inputClass} {...register('name')} />
          </Field>
          <Field label={t('book.email')} error={errors.email?.message}>
            <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
          </Field>
          <Field label={t('book.phone')} error={errors.phone?.message}>
            <input type="tel" autoComplete="tel" className={inputClass} {...register('phone')} />
          </Field>
          <Field label={t('book.country')}>
            <input autoComplete="country-name" className={inputClass} {...register('country')} />
          </Field>
        </div>
        <Field label={t('plan.message')}>
          <textarea rows={4} className={inputClass} {...register('message')} />
        </Field>

        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-accent-600 px-6 py-3 font-medium text-white hover:bg-accent-700 disabled:opacity-60">
          {t('plan.submit')}
        </button>
      </form>
    </div>
  );
}

export default Plan;
