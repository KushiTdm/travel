import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTour } from '@/lib/useTours';
import { useDepartures } from '@/lib/useDepartures';
import { useCurrentLang } from '@/lib/useCurrentLang';
import { submitInquiry } from '@/store/useDemoStore';
import { WHATSAPP_NUMBER } from '@/config';
import type { Inquiry } from '@/types/inquiry';
import Field, { inputClass } from '@/components/Field';
import StatusBadge from '@/components/StatusBadge';
import { formatDate } from '@/lib/formatDate';

type Values = {
  departureId: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  consent: boolean;
};

const STEP_FIELDS: Array<Array<keyof Values>> = [
  ['departureId', 'adults', 'children'],
  ['name', 'email', 'phone', 'country', 'message'],
  ['consent'],
];

function Book() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const lang = useCurrentLang();
  const [searchParams] = useSearchParams();
  const { tour } = useTour(slug);
  const { departures } = useDepartures(slug);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Inquiry | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        departureId: z.string().min(1, t('book.errors.departure')),
        adults: z.number({ error: t('book.errors.adults') }).int().min(1, t('book.errors.adults')).max(12),
        children: z.number({ error: t('book.errors.adults') }).int().min(0).max(8),
        name: z.string().trim().min(2, t('book.errors.name')),
        email: z.email(t('book.errors.email')),
        phone: z.string().trim().regex(/^\+?[\d\s().-]{7,}$/, t('book.errors.phone')),
        country: z.string().trim().min(2, t('book.errors.country')),
        message: z.string().max(1000),
        consent: z.boolean().refine((v) => v, t('book.errors.consent')),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      departureId: searchParams.get('departure') ?? '',
      adults: 2,
      children: 0,
      name: '',
      email: '',
      phone: '',
      country: '',
      message: '',
      consent: false,
    },
  });

  if (!tour) {
    return <p className="py-12 text-center text-surface-500">{t('tourDetail.notFound')}</p>;
  }
  const title = tour.translations[lang].title;
  const selected = departures.find((d) => d.id === getValues('departureId'));

  const next = async () => {
    if (!(await trigger(STEP_FIELDS[step]))) return;
    if (step === 0) {
      const dep = departures.find((d) => d.id === getValues('departureId'));
      const travellers = getValues('adults') + getValues('children');
      if (dep && travellers > dep.remaining) {
        setError('adults', { message: t('book.notEnoughSpots', { count: dep.remaining }) });
        return;
      }
    }
    setStep(step + 1);
  };

  const onSubmit = handleSubmit(async (v) => {
    const inquiry = await submitInquiry({
      source: 'booking',
      tourSlug: tour.slug,
      data: {
        departureId: v.departureId,
        adults: v.adults,
        children: v.children,
        name: v.name,
        email: v.email,
        phone: v.phone,
        country: v.country,
        message: v.message,
      },
    });
    setDone(inquiry);
  });

  if (done) {
    const text = encodeURIComponent(t('book.whatsappText', { reference: done.reference }));
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-surface-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-primary-800">{t('book.confirmTitle')}</h1>
        <p className="mt-3 text-surface-600">{t('book.confirmText')}</p>
        <p className="mt-1 text-2xl font-mono font-bold text-accent-600">{done.reference}</p>
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

  const steps = t('book.steps', { returnObjects: true }) as string[];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-800">{t('book.title', { tour: title })}</h1>
      <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('book.demoNote')}</p>

      <ol className="mt-6 flex gap-2 text-xs font-medium">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded px-2 py-1.5 text-center ${
              i === step ? 'bg-accent-600 text-white' : i < step ? 'bg-accent-100 text-accent-800' : 'bg-surface-200 text-surface-500'
            }`}
          >
            {label}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-surface-500">{t('book.step', { current: step + 1, total: 3 })}</p>

      <form
        className="mt-4 space-y-4 rounded-lg border border-surface-200 bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) void next();
          else void onSubmit();
        }}
        noValidate
      >
        {step === 0 && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-surface-700">{t('book.departure')}</legend>
              <div className="space-y-2">
                {departures.map((d) => (
                  <label
                    key={d.id}
                    className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${
                      d.status === 'full' ? 'cursor-not-allowed border-surface-200 opacity-60' : 'cursor-pointer border-surface-300 hover:border-accent-500'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input type="radio" value={d.id} disabled={d.status === 'full'} {...register('departureId')} />
                      {formatDate(d.startDate, lang)}
                    </span>
                    <StatusBadge status={d.status} />
                  </label>
                ))}
              </div>
              {errors.departureId && <p className="mt-1 text-xs text-error-600">{errors.departureId.message}</p>}
            </fieldset>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('book.adults')} error={errors.adults?.message}>
                <input type="number" min={1} max={12} className={inputClass} {...register('adults', { valueAsNumber: true })} />
              </Field>
              <Field label={t('book.children')} error={errors.children?.message}>
                <input type="number" min={0} max={8} className={inputClass} {...register('children', { valueAsNumber: true })} />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Field label={t('book.name')} error={errors.name?.message}>
              <input autoComplete="name" className={inputClass} {...register('name')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('book.email')} error={errors.email?.message}>
                <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
              </Field>
              <Field label={t('book.phone')} error={errors.phone?.message}>
                <input type="tel" autoComplete="tel" className={inputClass} {...register('phone')} />
              </Field>
            </div>
            <Field label={t('book.country')} error={errors.country?.message}>
              <input autoComplete="country-name" className={inputClass} {...register('country')} />
            </Field>
            <Field label={t('book.message')} error={errors.message?.message}>
              <textarea rows={4} className={inputClass} {...register('message')} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <dl className="divide-y divide-surface-200 text-sm">
              {[
                [t('book.summaryTour'), title],
                [t('book.summaryDeparture'), selected ? formatDate(selected.startDate, lang) : ''],
                [t('book.summaryTravellers'), t('book.travellers', { adults: getValues('adults'), children: getValues('children') })],
                [t('book.summaryContact'), `${getValues('name')} · ${getValues('email')} · ${getValues('phone')} · ${getValues('country')}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                  <dt className="text-surface-500">{k}</dt>
                  <dd className="text-right font-medium text-surface-800">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="flex items-start gap-2 text-sm text-surface-700">
              <input type="checkbox" className="mt-1" {...register('consent')} />
              {t('book.consent')}
            </label>
            {errors.consent && <p className="text-xs text-error-600">{errors.consent.message}</p>}
          </>
        )}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 disabled:invisible"
          >
            {t('book.back')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-accent-600 px-5 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
          >
            {step < 2 ? t('book.next') : t('book.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Book;
