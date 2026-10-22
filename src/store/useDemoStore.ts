import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Inquiry, InquiryData, InquirySource, InquiryStatus } from '@/types/inquiry';
import { DEMO_EMAIL, DEMO_PASSWORD, REFERENCE_PREFIX, STORE_KEY } from '@/config';

interface NewInquiry {
  source: InquirySource;
  tourSlug: string | null;
  data: InquiryData;
}

interface DemoState {
  inquiries: Inquiry[];
  adminSession: { email: string } | null;
  /** References that arrived from another tab in this session (not persisted). */
  freshReferences: string[];
  addInquiry: (input: NewInquiry) => Inquiry;
  setStatus: (reference: string, status: InquiryStatus) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  clearFresh: (reference: string) => void;
}

function nextReference(existing: Inquiry[], year: number): string {
  const prefix = `${REFERENCE_PREFIX}-${year}-`;
  const max = existing
    .filter((i) => i.reference.startsWith(prefix))
    .reduce((m, i) => Math.max(m, Number(i.reference.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      inquiries: [],
      adminSession: null,
      freshReferences: [],
      addInquiry: (input) => {
        // Another tab may have written since we last hydrated: read the freshest list.
        const current = get().inquiries;
        const now = new Date();
        const inquiry: Inquiry = {
          reference: nextReference(current, now.getFullYear()),
          source: input.source,
          tourSlug: input.tourSlug,
          data: input.data,
          status: 'new',
          createdAt: now.toISOString(),
        };
        set({ inquiries: [inquiry, ...current] });
        return inquiry;
      },
      setStatus: (reference, status) =>
        set({
          inquiries: get().inquiries.map((i) => (i.reference === reference ? { ...i, status } : i)),
        }),
      login: (email, password) => {
        if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
          set({ adminSession: { email: DEMO_EMAIL } });
          return true;
        }
        return false;
      },
      logout: () => set({ adminSession: null }),
      clearFresh: (reference) =>
        set({ freshReferences: get().freshReferences.filter((r) => r !== reference) }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ inquiries: s.inquiries, adminSession: s.adminSession }),
    },
  ),
);

/**
 * Keeps this tab in sync with writes made by other tabs. The `storage` event only
 * fires in *other* tabs, so inquiries submitted elsewhere show up here immediately.
 */
export function startCrossTabSync(): () => void {
  const onStorage = async (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    const before = new Set(useDemoStore.getState().inquiries.map((i) => i.reference));
    await useDemoStore.persist.rehydrate();
    const incoming = useDemoStore
      .getState()
      .inquiries.filter((i) => !before.has(i.reference))
      .map((i) => i.reference);
    if (incoming.length > 0) {
      useDemoStore.setState((s) => ({ freshReferences: [...incoming, ...s.freshReferences] }));
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function resetDemo(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
  window.location.reload();
}

/** Rehydrates first so the reference counter never collides with another tab's write. */
export async function submitInquiry(input: NewInquiry): Promise<Inquiry> {
  await useDemoStore.persist.rehydrate();
  return useDemoStore.getState().addInquiry(input);
}
