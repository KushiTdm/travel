import { useEffect, useState } from 'react';
import type { Tour } from '@/types/tour';
import { tourRepository } from '@/lib/tourRepository';

interface ToursState {
  tours: Tour[];
  loading: boolean;
  error: string | null;
}

export function useTours(): ToursState {
  const [state, setState] = useState<ToursState>({
    tours: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ tours: [], loading: true, error: null });
    tourRepository
      .list()
      .then((tours) => {
        if (active) setState({ tours, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ tours: [], loading: false, error: 'Failed to load tours' });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

interface TourState {
  tour: Tour | null;
  loading: boolean;
  error: string | null;
}

export function useTour(slug: string | undefined): TourState {
  const [state, setState] = useState<TourState>({
    tour: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) {
      setState({ tour: null, loading: false, error: 'Missing slug' });
      return;
    }
    let active = true;
    setState({ tour: null, loading: true, error: null });
    tourRepository
      .getBySlug(slug)
      .then((tour) => {
        if (active) {
          setState({
            tour,
            loading: false,
            error: tour ? null : 'Tour not found',
          });
        }
      })
      .catch(() => {
        if (active) setState({ tour: null, loading: false, error: 'Failed to load tour' });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}
