import type { Tour } from '@/types/tour';

const gradients: Record<string, string> = {
  vietnam: 'from-emerald-700 to-teal-500',
  cambodia: 'from-amber-700 to-orange-400',
  laos: 'from-sky-800 to-cyan-500',
};

/** Shown until real photography is added (Tour.cover). */
function Cover({ tour, alt, className = '' }: { tour: Tour; alt: string; className?: string }) {
  if (tour.cover) {
    return <img src={tour.cover} alt={alt} loading="lazy" className={`w-full h-full object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`w-full h-full bg-gradient-to-br ${gradients[tour.countries[0]]} flex items-end p-3 text-white/90 text-xs font-medium ${className}`}
    >
      {tour.startCity} → {tour.endCity}
    </div>
  );
}

export default Cover;
