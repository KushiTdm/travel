import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500';

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-surface-700 mb-1">{label}</span>
      {children}
      {error && <span className="block mt-1 text-xs text-error-600">{error}</span>}
    </label>
  );
}

export default Field;
