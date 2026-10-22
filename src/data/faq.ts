import type { Language } from '@/types/tour';

export interface FaqItem {
  q: string;
  a: string;
}

/** Practical rules (visas, passes) change: answers point travellers to official sources. */
const faq: Record<Language, FaqItem[]> = {
  fr: [
    {
      q: 'Quelle est la meilleure période pour voyager sur le Mékong ?',
      a: 'De décembre à avril, la saison sèche est la plus agréable pour le delta, Angkor et le Laos. De mai à novembre, c’est la saison verte : paysages luxuriants et moins de monde, mais des averses fréquentes.',
    },
    {
      q: 'Ai-je besoin d’un visa ?',
      a: 'Cela dépend de votre nationalité et change régulièrement. Le Vietnam, le Cambodge et le Laos proposent chacun un e-visa ou un visa à l’arrivée pour de nombreux pays. Vérifiez les sites officiels environ trois mois avant le départ ; nous vous envoyons la liste des documents utiles avec votre devis.',
    },
    {
      q: 'Le pass Angkor est-il inclus ?',
      a: 'Non, il est acheté à part. Le pass 3 jours coûte 62 USD par personne. Il est réglé sur place ou en ligne, et nous vous guidons sur la démarche.',
    },
    {
      q: 'Quelle est la taille des groupes ?',
      a: 'Nos circuits en petit groupe comptent de 10 à 12 voyageurs, avec un guide local. La croisière accueille jusqu’à 30 passagers. Des versions privées sont possibles sur demande.',
    },
    {
      q: 'Comment se passe la réservation ?',
      a: 'Vous envoyez une demande sans engagement, un conseiller répond sous un jour ouvré avec un devis, puis un acompte confirme la réservation. Sur ce site de démonstration, rien n’est réellement envoyé ni payé.',
    },
    {
      q: 'Dois-je souscrire une assurance voyage ?',
      a: 'Nous la recommandons vivement : assistance médicale, rapatriement et annulation. Consultez aussi votre médecin ou un centre de vaccination avant de partir.',
    },
  ],
  en: [
    {
      q: 'When is the best time to travel along the Mekong?',
      a: 'December to April, the dry season, is the most comfortable for the delta, Angkor and Laos. May to November is the green season: lush landscapes and fewer visitors, but frequent showers.',
    },
    {
      q: 'Do I need a visa?',
      a: 'It depends on your nationality and changes regularly. Vietnam, Cambodia and Laos each offer an e-visa or visa on arrival to many countries. Check the official websites about three months before departure; we send you a list of useful documents with your quote.',
    },
    {
      q: 'Is the Angkor pass included?',
      a: 'No, it is bought separately. The 3-day pass costs US$62 per person. It is paid on site or online, and we guide you through the process.',
    },
    {
      q: 'How big are the groups?',
      a: 'Our small-group tours have 10 to 12 travellers with a local guide. The cruise carries up to 30 passengers. Private versions are available on request.',
    },
    {
      q: 'How does booking work?',
      a: 'You send a no-commitment request, an advisor replies within one business day with a quote, then a deposit confirms the booking. On this demo site, nothing is actually sent or paid.',
    },
    {
      q: 'Do I need travel insurance?',
      a: 'We strongly recommend it: medical assistance, repatriation and cancellation cover. Also see your doctor or a travel-vaccination centre before you go.',
    },
  ],
};

export default faq;
