import type { Departure } from '@/types/departure';

function inDays(offset: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Dates are generated relative to today so the demo always shows upcoming departures.
const plan: Array<[tourSlug: string, capacity: number, offsets: number[], booked: number[]]> = [
  ['mekong-delta-3-days', 12, [14, 35, 63], [9, 12, 3]],
  ['angkor-siem-reap-3-days', 12, [21, 42, 70], [5, 11, 12]],
  ['luang-prabang-4-days', 10, [28, 49, 77], [10, 4, 2]],
  ['delta-to-phnom-penh-5-days', 12, [18, 46, 74], [7, 10, 0]],
  ['mekong-river-cruise-7-days', 30, [30, 60, 90], [24, 30, 11]],
];

const departures: Departure[] = plan.flatMap(([tourSlug, capacity, offsets, booked]) =>
  offsets.map((offset, i) => {
    const startDate = inDays(offset);
    return {
      id: `${tourSlug}-${startDate}`,
      tourSlug,
      startDate,
      capacity,
      bookedCount: booked[i],
    };
  }),
);

export default departures;
