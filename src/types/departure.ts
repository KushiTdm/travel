export type DepartureStatus = 'available' | 'few_left' | 'full';

export interface Departure {
  id: string;
  tourSlug: string;
  /** ISO date (YYYY-MM-DD). */
  startDate: string;
  capacity: number;
  bookedCount: number;
}

export interface DepartureWithStatus extends Departure {
  remaining: number;
  status: DepartureStatus;
}
