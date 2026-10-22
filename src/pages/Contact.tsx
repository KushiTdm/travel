import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitInquiry } from '@/store/useDemoStore';
import type { Inquiry } from '@/types/inquiry';
import Field, { inputClass } from '@/components/Field';

type Values = { name: string; email: string; phone: string; country: string; message: string };

function Contact() {
  const { t } = useTranslation();
  const [done, setDone] = useState<Inquiry | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('book.errors.name')),
        email: z.email(t('book.errors.email')),
        phone: z.string().trim().refine((v) => v === '' || /^\+?[\d\s().-]{7,}$/.test(v), t('book.errors.phone')),
        country: z.string().trim(),
        message: z.string().trim().min(10).max(1000),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', country: '', message: '' },
  });

  const onSubmit = handleSubmit(async (v) => {
    setDone(await submitInquiry({ source: 'form', tourSlug: null, data: v }));
    reset();
  });

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-surface-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-primary-800">{t('contact.sentTitle')}</h1>
        <p className="mt-3 text-surface-600">{t('contact.sentText')}</p>
        <p className="mt-1 font-mono text-2xl font-bold text-accent-600">{done.reference}</p>
        <p className="mt-3 text-xs text-surface-500">{t('book.confirmDemo')}</p>
        <button onClick={() => setDone(null)} className="mt-6 text-sm text-accent-600 hover:text-accent-700">
          {t('contact.newMessage')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-primary-800">{t('contact.title')}</h1>
      <p className="mt-2 text-surface-600">{t('contact.subtitle')}</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4 rounded-lg border border-surface-200 bg-white p-6">
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
          <textarea rows={5} className={inputClass} {...register('message')} />
        </Field>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-accent-600 px-5 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
        >
          {t('contact.submit')}
        </button>
      </form>
    </div>
  );
}

export default Contact;
