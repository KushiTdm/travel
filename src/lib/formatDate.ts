export function formatDate(iso: string, lang: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
