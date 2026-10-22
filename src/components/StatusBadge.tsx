import { useTranslation } from 'react-i18next';
import type { DepartureStatus } from '@/types/departure';

const styles: Record<DepartureStatus, string> = {
  available: 'bg-success-100 text-success-800',
  few_left: 'bg-amber-100 text-amber-800',
  full: 'bg-surface-200 text-surface-600',
};

function StatusBadge({ status }: { status: DepartureStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export default StatusBadge;
