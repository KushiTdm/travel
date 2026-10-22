import { useEffect, useState } from 'react';
import type { DepartureWithStatus } from '@/types/departure';
import { tourRepository } from '@/lib/tourRepository';

interface DeparturesState {
  departures: DepartureWithStatus[];
  loading: boolean;
}

export function useDepartures(slug: string | undefined): DeparturesState {
  const [state, setState] = useState<DeparturesState>({ departures: [], loading: true });

  useEffect(() => {
    if (!slug) {
      setState({ departures: [], loading: false });
      return;
    }
    let active = true;
    setState({ departures: [], loading: true });
    tourRepository
      .listDepartures(slug)
      .then((departures) => active && setState({ departures, loading: false }))
      .catch(() => active && setState({ departures: [], loading: false }));
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}
