import type { Country, Localized } from '@/types/tour';

export interface Destination {
  country: Country;
  cover: string;
  /** Region used for the weather widget and map hint. */
  highlights: Localized<string[]>;
  translations: Localized<{
    tagline: string;
    intro: string;
    bestSeason: string;
    practical: string;
  }>;
}

const destinations: Destination[] = [
  {
    country: 'vietnam',
    cover: '/images/destinations/vietnam.webp',
    highlights: {
      fr: ['Marché flottant de Cai Rang (Can Tho)', 'Canaux et vergers de Vinh Long et Ben Tre', 'Chau Doc et la frontière cambodgienne', 'Hô Chi Minh-Ville, point de départ'],
      en: ['Cai Rang floating market (Can Tho)', 'Canals and orchards of Vinh Long and Ben Tre', 'Chau Doc and the Cambodian border', 'Ho Chi Minh City, the usual starting point'],
    },
    translations: {
      fr: {
        tagline: 'Le delta du Mékong, entre canaux, vergers et marchés flottants',
        intro: 'Au sud d’Hô Chi Minh-Ville, le Mékong se divise en un labyrinthe de bras, d’îlots et de rizières. On le parcourt en sampan, à vélo et à pied, avec une nuit en homestay.',
        bestSeason: 'Décembre à avril : saison sèche, la plus agréable. De mai à novembre, la saison verte apporte des averses mais des paysages éclatants.',
        practical: 'Prévoyez des visas à l’avance : les règles dépendent de votre nationalité et évoluent, vérifiez les sites officiels.',
      },
      en: {
        tagline: 'The Mekong Delta: canals, orchards and floating markets',
        intro: 'South of Ho Chi Minh City the Mekong splits into a maze of channels, islets and rice fields. You explore it by sampan, bicycle and on foot, with a night in a homestay.',
        bestSeason: 'December to April: dry season, the most comfortable. May to November is the green season, with showers but vivid landscapes.',
        practical: 'Arrange visas in advance: rules depend on your nationality and change, so check the official websites.',
      },
    },
  },
  {
    country: 'cambodia',
    cover: '/images/destinations/cambodia.webp',
    highlights: {
      fr: ['Angkor Wat, Angkor Thom et Ta Prohm', 'Lac Tonlé Sap et villages flottants', 'Phnom Penh : Palais royal et Musée national', 'Kampong Chhnang et ses poteries'],
      en: ['Angkor Wat, Angkor Thom and Ta Prohm', 'Tonle Sap lake and floating villages', 'Phnom Penh: Royal Palace and National Museum', 'Kampong Chhnang and its pottery'],
    },
    translations: {
      fr: {
        tagline: 'Angkor, le Tonlé Sap et Phnom Penh',
        intro: 'Du plus grand ensemble de temples du monde aux villages sur pilotis du Tonlé Sap, le Cambodge se découvre à pied, en bateau et en char à bœufs.',
        bestSeason: 'Novembre à avril : saison sèche et fraîche. Le niveau du Tonlé Sap varie fortement selon les mois, ce qui change les excursions en bateau.',
        practical: 'Le pass Angkor 3 jours (62 USD) est acheté à part. Visa : e-visa ou à l’arrivée selon la nationalité.',
      },
      en: {
        tagline: 'Angkor, Tonle Sap and Phnom Penh',
        intro: 'From the world’s largest temple complex to the stilt villages of Tonle Sap, Cambodia is explored on foot, by boat and by ox-cart.',
        bestSeason: 'November to April: dry and cooler. The Tonle Sap water level changes greatly through the year, which affects boat excursions.',
        practical: 'The 3-day Angkor pass (US$62) is bought separately. Visa: e-visa or on arrival depending on nationality.',
      },
    },
  },
  {
    country: 'laos',
    cover: '/images/destinations/laos.webp',
    highlights: {
      fr: ['Luang Prabang, ville classée UNESCO', 'Aumône des moines (Tak Bat) à l’aube', 'Grottes de Pak Ou en bateau sur le Mékong', 'Chutes de Kuang Si'],
      en: ['Luang Prabang, a UNESCO-listed town', 'Monks’ alms ceremony (Tak Bat) at dawn', 'Pak Ou caves by boat on the Mekong', 'Kuang Si falls'],
    },
    translations: {
      fr: {
        tagline: 'Luang Prabang, le Mékong au rythme lent',
        intro: 'Au Laos, le Mékong coule entre collines et temples dorés. Luang Prabang, classée au patrimoine mondial de l’UNESCO, se visite à pied et en bateau.',
        bestSeason: 'Novembre à février : frais et sec, idéal. Mars et avril sont plus chauds, avec parfois de la fumée dans l’air.',
        practical: 'Visa : e-visa ou à l’arrivée selon la nationalité. Sanctuaire d’éléphants : choisissez un lieu éthique, sans monte.',
      },
      en: {
        tagline: 'Luang Prabang, the Mekong at a slow pace',
        intro: 'In Laos the Mekong runs between hills and golden temples. Luang Prabang, a UNESCO World Heritage town, is explored on foot and by boat.',
        bestSeason: 'November to February: cool and dry, ideal. March and April are hotter, sometimes with smoke in the air.',
        practical: 'Visa: e-visa or on arrival depending on nationality. For elephant sanctuaries, choose an ethical venue with no riding.',
      },
    },
  },
];

export default destinations;
