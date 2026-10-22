/**
 * Single data-access point for the site. In the demo it reads local mock files;
 * in production, replace the bodies below with real API/CMS/booking-system calls.
 * Nothing else in the app should import src/data/* directly.
 */
import type { Tour } from '@/types/tour';
import type { Departure, DepartureStatus, DepartureWithStatus } from '@/types/departure';
import toursData from '@/data/tours';
import departuresData from '@/data/departures';

const LATENCY_MS = 200;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export function computeStatus(capacity: number, bookedCount: number): DepartureStatus {
  const remaining = capacity - bookedCount;
  if (remaining <= 0) return 'full';
  if (remaining / capacity <= 0.2) return 'few_left';
  return 'available';
}

export function withStatus(d: Departure): DepartureWithStatus {
  const remaining = Math.max(0, d.capacity - d.bookedCount);
  return { ...d, remaining, status: computeStatus(d.capacity, d.bookedCount) };
}

async function list(): Promise<Tour[]> {
  return delay([...toursData]);
}

async function getBySlug(slug: string): Promise<Tour | null> {
  return delay(toursData.find((t) => t.slug === slug) ?? null);
}

async function listDepartures(slug: string): Promise<DepartureWithStatus[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = departuresData
    .filter((d) => d.tourSlug === slug && d.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map(withStatus);
  return delay(rows);
}

export const tourRepository = { list, getBySlug, listDepartures };
