export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'confirmed' | 'lost';
export type InquirySource = 'booking' | 'form' | 'tailor_made';

export const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'quoted',
  'confirmed',
  'lost',
];

export interface InquiryData {
  departureId?: string;
  adults?: number;
  children?: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  /** Tailor-made brief (source 'tailor_made'). */
  destinations?: string[];
  styles?: string[];
  period?: string;
  duration?: string;
  budget?: string;
}

export interface Inquiry {
  reference: string;
  source: InquirySource;
  tourSlug: string | null;
  data: InquiryData;
  status: InquiryStatus;
  createdAt: string;
}
