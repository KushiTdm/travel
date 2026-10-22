/**
 * Debug switches to bisect rendering glitches: open the site with e.g. `?hero=noblur,nogl`.
 *   noblur     header without backdrop-filter
 *   nograin    no grain overlay
 *   nocontain  no paint containment on the hero
 *   noscale    no dolly scaling (translation only)
 */
const raw = typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('hero') ?? '');
const flags = new Set(raw.split(',').filter(Boolean));

export const heroFlag = (name: string): boolean => flags.has(name);
