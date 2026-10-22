export type Language = 'fr' | 'en';
export type Country = 'vietnam' | 'cambodia' | 'laos';
export type TravelStyle = 'culture' | 'nature' | 'river' | 'food' | 'family' | 'slow';
export const TRAVEL_STYLES: TravelStyle[] = ['culture', 'nature', 'river', 'food', 'family', 'slow'];
export type Difficulty = 'easy' | 'moderate' | 'demanding';

export type Localized<T> = Record<Language, T>;

export interface TourTranslation {
  title: string;
  summary: string;
  inclusions: string[];
  exclusions: string[];
}

export interface ItineraryDay {
  day: number;
  /** null on the last day when the tour ends without a night. */
  overnightLocation: Localized<string> | null;
  translations: Localized<{ title: string; description: string }>;
}

export interface Tour {
  slug: string;
  countries: Country[];
  styles: TravelStyle[];
  startCity: string;
  endCity: string;
  durationDays: number;
  difficulty: Difficulty;
  groupMax: number;
  /** Indicative price per person, small-group, twin share. */
  priceFromEur: number;
  /** Coordinates used for the live weather widget. */
  weather: { place: string; lat: number; lon: number };
  /** Optional image URL; a gradient placeholder is used when absent. */
  cover?: string;
  translations: Localized<TourTranslation>;
  itinerary: ItineraryDay[];
}
