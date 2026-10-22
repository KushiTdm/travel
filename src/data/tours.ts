import type { Tour } from '@/types/tour';

/**
 * Itineraries are based on routes published by regional operators and tourism
 * boards (vietnam.travel, Pandaw / CroisiEurope river cruises, Laos and Cambodia
 * specialists). Prices are indicative "from" prices per person in EUR.
 * This file is replaced by a real data source via src/lib/tourRepository.ts.
 */
const tours: Tour[] = [
  {
    slug: 'mekong-delta-3-days',
    cover: '/images/tours/mekong-delta-3-days.webp',
    countries: ['vietnam'],
    styles: ['river', 'food', 'family'],
    startCity: 'Ho Chi Minh City',
    endCity: 'Ho Chi Minh City',
    durationDays: 3,
    difficulty: 'easy',
    groupMax: 12,
    priceFromEur: 190,
    weather: { place: 'Can Tho', lat: 10.0452, lon: 105.7469 },
    translations: {
      fr: {
        title: 'Delta du Mékong — 3 jours',
        summary:
          'Trois jours au cœur du delta : marché flottant de Cai Be, vergers et canaux de Vinh Long en sampan, puis le marché de Cai Rang à l’aube à Can Tho.',
        inclusions: [
          'Guide francophone ou anglophone',
          '2 nuits (homestay et hôtel)',
          'Petits-déjeuners et 4 repas',
          'Bateaux et sampans, transferts en minibus',
        ],
        exclusions: ['Vols internationaux', 'Visa', 'Assurance voyage', 'Pourboires'],
      },
      en: {
        title: 'Mekong Delta — 3 days',
        summary:
          'Three days in the heart of the delta: Cai Be floating market, orchards and canals of Vinh Long by sampan, then Cai Rang market at dawn in Can Tho.',
        inclusions: [
          'French or English-speaking guide',
          '2 nights (homestay and hotel)',
          'Breakfasts and 4 meals',
          'Boats and sampans, minibus transfers',
        ],
        exclusions: ['International flights', 'Visa', 'Travel insurance', 'Tips'],
      },
    },
    itinerary: [
      {
        day: 1,
        overnightLocation: { fr: 'Vinh Long', en: 'Vinh Long' },
        translations: {
          fr: {
            title: 'Hô Chi Minh-Ville → Cai Be → Vinh Long',
            description:
              'Départ vers 7h30, environ 2 à 3 h de route jusqu’à Cai Be. Marché flottant, atelier de papier de riz et de bonbons de coco, puis promenade dans les vergers avant de rejoindre votre homestay à Vinh Long.',
          },
          en: {
            title: 'Ho Chi Minh City → Cai Be → Vinh Long',
            description:
              'Depart around 7:30, roughly 2–3 hours by road to Cai Be. Floating market, rice-paper and coconut-candy workshop, then a walk through the orchards before settling into your homestay in Vinh Long.',
          },
        },
      },
      {
        day: 2,
        overnightLocation: { fr: 'Can Tho', en: 'Can Tho' },
        translations: {
          fr: {
            title: 'Vinh Long → Can Tho',
            description:
              'Matinée en sampan dans les petits canaux, puis à vélo ou à pied dans les vergers. Transfert de 2 h 30 à 3 h 30 jusqu’à Can Tho ; soirée libre sur le quai de Ninh Kieu et ses marchés.',
          },
          en: {
            title: 'Vinh Long → Can Tho',
            description:
              'Morning sampan ride through the narrow canals, then cycling or walking through fruit orchards. Transfer of 2.5–3.5 hours to Can Tho; free evening on the Ninh Kieu riverfront and its markets.',
          },
        },
      },
      {
        day: 3,
        overnightLocation: null,
        translations: {
          fr: {
            title: 'Marché flottant de Cai Rang → Hô Chi Minh-Ville',
            description:
              'Départ en bateau vers 5h30 pour voir le marché de Cai Rang à son apogée, soupe hủ tiếu à bord. Retour à Hô Chi Minh-Ville dans l’après-midi.',
          },
          en: {
            title: 'Cai Rang floating market → Ho Chi Minh City',
            description:
              'Boat departure around 5:30 to see Cai Rang market at its busiest, with a bowl of hủ tiếu noodle soup on board. Return to Ho Chi Minh City in the late afternoon.',
          },
        },
      },
    ],
  },
  {
    slug: 'angkor-siem-reap-3-days',
    cover: '/images/tours/angkor-siem-reap-3-days.webp',
    countries: ['cambodia'],
    styles: ['culture', 'family'],
    startCity: 'Siem Reap',
    endCity: 'Siem Reap',
    durationDays: 3,
    difficulty: 'moderate',
    groupMax: 12,
    priceFromEur: 240,
    weather: { place: 'Siem Reap', lat: 13.3633, lon: 103.8564 },
    translations: {
      fr: {
        title: 'Angkor et Siem Reap — 3 jours',
        summary:
          'Le grand circuit, le lever de soleil sur Angkor Wat, Angkor Thom, Ta Prohm et le lac Tonlé Sap, avec un guide agréé.',
        inclusions: [
          'Guide agréé francophone ou anglophone',
          '2 nuits à Siem Reap',
          'Petits-déjeuners',
          'Transferts privés en véhicule climatisé',
        ],
        exclusions: [
          'Pass Angkor 3 jours (62 USD)',
          'Vols internationaux',
          'Visa',
          'Assurance voyage',
          'Pourboires',
        ],
      },
      en: {
        title: 'Angkor & Siem Reap — 3 days',
        summary:
          'The Grand Circuit, sunrise over Angkor Wat, Angkor Thom, Ta Prohm and Tonle Sap lake, with a licensed guide.',
        inclusions: [
          'Licensed French or English-speaking guide',
          '2 nights in Siem Reap',
          'Breakfasts',
          'Private air-conditioned transfers',
        ],
        exclusions: [
          '3-day Angkor pass (US$62)',
          'International flights',
          'Visa',
          'Travel insurance',
          'Tips',
        ],
      },
    },
    itinerary: [
      {
        day: 1,
        overnightLocation: { fr: 'Siem Reap', en: 'Siem Reap' },
        translations: {
          fr: {
            title: 'Le grand circuit',
            description:
              'Preah Khan, Neak Pean, Ta Som et l’East Mebon, puis coucher de soleil depuis Pre Rup ou Phnom Bakheng. Environ 6 h de visite.',
          },
          en: {
            title: 'The Grand Circuit',
            description:
              'Preah Khan, Neak Pean, Ta Som and East Mebon, then sunset from Pre Rup or Phnom Bakheng. About 6 hours of sightseeing.',
          },
        },
      },
      {
        day: 2,
        overnightLocation: { fr: 'Siem Reap', en: 'Siem Reap' },
        translations: {
          fr: {
            title: 'Angkor Wat, Angkor Thom et Ta Prohm',
            description:
              'Départ avant l’aube pour le lever de soleil sur Angkor Wat, puis Angkor Thom avec les visages du Bayon, le Baphuon et la terrasse des Éléphants. L’après-midi, Ta Prohm et ses racines de figuiers étrangleurs.',
          },
          en: {
            title: 'Angkor Wat, Angkor Thom and Ta Prohm',
            description:
              'Pre-dawn start for sunrise over Angkor Wat, then Angkor Thom with the Bayon faces, the Baphuon and the Terrace of the Elephants. In the afternoon, Ta Prohm and its strangler-fig roots.',
          },
        },
      },
      {
        day: 3,
        overnightLocation: null,
        translations: {
          fr: {
            title: 'Lac Tonlé Sap et marché',
            description:
              'Excursion en bateau vers les villages flottants de Chong Khneas ou Kampong Phluk, puis retour à Siem Reap et flânerie au Vieux Marché (Psar Chas) avant votre départ.',
          },
          en: {
            title: 'Tonle Sap lake and market',
            description:
              'Boat excursion to the floating villages of Chong Khneas or Kampong Phluk, then back to Siem Reap for a stroll through the Old Market (Psar Chas) before departure.',
          },
        },
      },
    ],
  },
  {
    slug: 'luang-prabang-4-days',
    cover: '/images/tours/luang-prabang-4-days.webp',
    countries: ['laos'],
    styles: ['culture', 'nature', 'slow'],
    startCity: 'Luang Prabang',
    endCity: 'Luang Prabang',
    durationDays: 4,
    difficulty: 'easy',
    groupMax: 10,
    priceFromEur: 290,
    weather: { place: 'Luang Prabang', lat: 19.8856, lon: 102.1347 },
    translations: {
      fr: {
        title: 'Luang Prabang et le Mékong — 4 jours',
        summary:
          'La ville classée UNESCO, l’aumône des moines, les grottes de Pak Ou en bateau, les chutes de Kuang Si et un sanctuaire d’éléphants éthique.',
        inclusions: [
          'Guide local francophone ou anglophone',
          '3 nuits en hôtel de charme',
          'Petits-déjeuners',
          'Bateau sur le Mékong, entrées aux sites',
        ],
        exclusions: ['Vols internationaux', 'Visa', 'Assurance voyage', 'Déjeuners et dîners', 'Pourboires'],
      },
      en: {
        title: 'Luang Prabang & the Mekong — 4 days',
        summary:
          'The UNESCO-listed town, the monks’ alms ceremony, the Pak Ou caves by boat, Kuang Si falls and an ethical elephant sanctuary.',
        inclusions: [
          'Local French or English-speaking guide',
          '3 nights in a boutique hotel',
          'Breakfasts',
          'Mekong boat, site entrance fees',
        ],
        exclusions: ['International flights', 'Visa', 'Travel insurance', 'Lunches and dinners', 'Tips'],
      },
    },
    itinerary: [
      {
        day: 1,
        overnightLocation: { fr: 'Luang Prabang', en: 'Luang Prabang' },
        translations: {
          fr: {
            title: 'Capitale royale et coucher de soleil sur le Mékong',
            description:
              'Visite à pied du Musée du Palais royal, du Wat Mai et du Wat Visoun. Coucher de soleil sur le Mékong depuis le mont Phousi, puis marché de nuit.',
          },
          en: {
            title: 'Royal capital and Mekong sunset',
            description:
              'Walking tour of the Royal Palace Museum, Wat Mai and Wat Visoun. Sunset over the Mekong from Mount Phousi, then the night market.',
          },
        },
      },
      {
        day: 2,
        overnightLocation: { fr: 'Luang Prabang', en: 'Luang Prabang' },
        translations: {
          fr: {
            title: 'Aumône, grottes de Pak Ou et chutes de Kuang Si',
            description:
              'Cérémonie du Tak Bat à l’aube, puis bateau sur le Mékong jusqu’aux grottes de Pak Ou et leurs milliers de Bouddhas, avec une halte à Ban Xang Hai. L’après-midi, baignade aux chutes de Kuang Si et centre de sauvetage des ours.',
          },
          en: {
            title: 'Alms giving, Pak Ou caves and Kuang Si falls',
            description:
              'Tak Bat alms ceremony at dawn, then a Mekong boat to the Pak Ou caves and their thousands of Buddhas, stopping at Ban Xang Hai. In the afternoon, swimming at Kuang Si falls and the bear rescue centre.',
          },
        },
      },
      {
        day: 3,
        overnightLocation: { fr: 'Luang Prabang', en: 'Luang Prabang' },
        translations: {
          fr: {
            title: 'Sanctuaire d’éléphants ou cours de cuisine lao',
            description:
              'Matinée dans un sanctuaire d’éléphants éthique (nourrissage, promenade à pied) ou cours de cuisine lao. Après-midi libre dans la péninsule classée UNESCO.',
          },
          en: {
            title: 'Elephant sanctuary or Lao cooking class',
            description:
              'Morning at an ethical elephant sanctuary (feeding, walking alongside the elephants) or a Lao cooking class. Free afternoon on the UNESCO-listed peninsula.',
          },
        },
      },
      {
        day: 4,
        overnightLocation: null,
        translations: {
          fr: {
            title: 'Marché du matin et départ',
            description:
              'Dernière visite du marché du matin (herbes, produits de la forêt, poisson du fleuve), puis transfert vers l’aéroport ou la gare.',
          },
          en: {
            title: 'Morning market and departure',
            description:
              'A last walk through the morning market (herbs, forest produce, river fish), then transfer to the airport or train station.',
          },
        },
      },
    ],
  },
  {
    slug: 'delta-to-phnom-penh-5-days',
    cover: '/images/tours/delta-to-phnom-penh-5-days.webp',
    countries: ['vietnam', 'cambodia'],
    styles: ['river', 'culture'],
    startCity: 'Ho Chi Minh City',
    endCity: 'Phnom Penh',
    durationDays: 5,
    difficulty: 'moderate',
    groupMax: 12,
    priceFromEur: 420,
    weather: { place: 'Chau Doc', lat: 10.7045, lon: 105.1172 },
    translations: {
      fr: {
        title: 'Du delta à Phnom Penh — 5 jours',
        summary:
          'Cinq jours de Hô Chi Minh-Ville à Phnom Penh : canaux de Ben Tre, marché de Cai Rang, Chau Doc, puis passage de la frontière en bateau sur le Mékong.',
        inclusions: [
          'Guide francophone ou anglophone',
          '4 nuits en hôtels de catégorie moyenne',
          'Petits-déjeuners',
          'Bateau rapide Chau Doc – Phnom Penh, transferts',
        ],
        exclusions: ['Vols internationaux', 'Visa Cambodge', 'Assurance voyage', 'Déjeuners et dîners', 'Pourboires'],
      },
      en: {
        title: 'Delta to Phnom Penh — 5 days',
        summary:
          'Five days from Ho Chi Minh City to Phnom Penh: Ben Tre canals, Cai Rang market, Chau Doc, then a border crossing by boat on the Mekong.',
        inclusions: [
          'French or English-speaking guide',
          '4 nights in mid-range hotels',
          'Breakfasts',
          'Chau Doc – Phnom Penh fast boat, transfers',
        ],
        exclusions: ['International flights', 'Cambodia visa', 'Travel insurance', 'Lunches and dinners', 'Tips'],
      },
    },
    itinerary: [
      {
        day: 1,
        overnightLocation: { fr: 'Vinh Long', en: 'Vinh Long' },
        translations: {
          fr: {
            title: 'Hô Chi Minh-Ville → My Tho / Ben Tre → Vinh Long',
            description:
              'Route vers My Tho ou Ben Tre, sampan dans les canaux de cocotiers, visite d’une ferme d’abeilles et d’un verger, puis arrivée à Vinh Long.',
          },
          en: {
            title: 'Ho Chi Minh City → My Tho / Ben Tre → Vinh Long',
            description:
              'Drive to My Tho or Ben Tre, sampan through coconut-palm canals, a visit to a bee farm and an orchard, then on to Vinh Long.',
          },
        },
      },
      {
        day: 2,
        overnightLocation: { fr: 'Can Tho', en: 'Can Tho' },
        translations: {
          fr: {
            title: 'Vinh Long → Can Tho',
            description:
              'Marché du matin, ateliers artisanaux et vie de village, puis transfert vers Can Tho pour la nuit.',
          },
          en: {
            title: 'Vinh Long → Can Tho',
            description:
              'Morning market, craft workshops and village life, then transfer to Can Tho for the night.',
          },
        },
      },
      {
        day: 3,
        overnightLocation: { fr: 'Chau Doc', en: 'Chau Doc' },
        translations: {
          fr: {
            title: 'Marché flottant de Cai Rang → Chau Doc',
            description:
              'Marché flottant de Cai Rang à l’aube, puis 4 à 5 h de route jusqu’à Chau Doc. L’après-midi : mont Sam, pagode khmère ou quai du Bassac.',
          },
          en: {
            title: 'Cai Rang floating market → Chau Doc',
            description:
              'Cai Rang floating market at dawn, then a 4–5 hour drive to Chau Doc. Afternoon at Sam Mountain, a Khmer pagoda or the Bassac riverfront.',
          },
        },
      },
      {
        day: 4,
        overnightLocation: { fr: 'Phnom Penh', en: 'Phnom Penh' },
        translations: {
          fr: {
            title: 'Chau Doc → Phnom Penh par le Mékong',
            description:
              'Bateau rapide à travers la frontière de Vinh Xuong / Ka’Om Samnor : comptez 5 à 6 h avec les formalités. Arrivée à Phnom Penh en fin d’après-midi.',
          },
          en: {
            title: 'Chau Doc → Phnom Penh by the Mekong',
            description:
              'Fast boat across the Vinh Xuong / Ka’Om Samnor border: allow 5–6 hours including formalities. Arrival in Phnom Penh in the late afternoon.',
          },
        },
      },
      {
        day: 5,
        overnightLocation: null,
        translations: {
          fr: {
            title: 'Phnom Penh et départ',
            description:
              'Palais royal et Pagode d’argent, Musée national, musée Tuol Sleng et/ou Killing Fields de Choeung Ek, puis transfert à l’aéroport.',
          },
          en: {
            title: 'Phnom Penh and departure',
            description:
              'Royal Palace and Silver Pagoda, National Museum, Tuol Sleng Museum and/or the Choeung Ek Killing Fields, then airport transfer.',
          },
        },
      },
    ],
  },
  {
    slug: 'mekong-river-cruise-7-days',
    cover: '/images/tours/mekong-river-cruise-7-days.webp',
    countries: ['cambodia', 'vietnam'],
    styles: ['river', 'slow', 'culture'],
    startCity: 'Siem Reap',
    endCity: 'Ho Chi Minh City',
    durationDays: 7,
    difficulty: 'easy',
    groupMax: 30,
    priceFromEur: 2400,
    weather: { place: 'Phnom Penh', lat: 11.5564, lon: 104.9282 },
    translations: {
      fr: {
        title: 'Croisière sur le Mékong — 7 jours',
        summary:
          'De Siem Reap à Hô Chi Minh-Ville à bord d’un bateau fluvial : Tonlé Sap, Phnom Penh, Tan Chau, Sa Dec et Cai Be.',
        inclusions: [
          'Cabine double à bord',
          'Pension complète à bord',
          'Excursions guidées à terre',
          'Transferts d’embarquement et de débarquement',
        ],
        exclusions: ['Vols internationaux', 'Visas', 'Assurance voyage', 'Boissons', 'Pourboires'],
      },
      en: {
        title: 'Mekong river cruise — 7 days',
        summary:
          'From Siem Reap to Ho Chi Minh City aboard a river ship: Tonle Sap, Phnom Penh, Tan Chau, Sa Dec and Cai Be.',
        inclusions: [
          'Twin cabin on board',
          'Full board on board',
          'Guided shore excursions',
          'Embarkation and disembarkation transfers',
        ],
        exclusions: ['International flights', 'Visas', 'Travel insurance', 'Drinks', 'Tips'],
      },
    },
    itinerary: [
      {
        day: 1,
        overnightLocation: { fr: 'À bord', en: 'On board' },
        translations: {
          fr: {
            title: 'Siem Reap → embarquement sur le Tonlé Sap',
            description:
              'Transfert de Siem Reap au point d’embarquement et début de la navigation sur le lac Tonlé Sap.',
          },
          en: {
            title: 'Siem Reap → embarkation on Tonle Sap',
            description:
              'Transfer from Siem Reap to the embarkation point and the start of the cruise across Tonle Sap lake.',
          },
        },
      },
      {
        day: 2,
        overnightLocation: { fr: 'À bord', en: 'On board' },
        translations: {
          fr: {
            title: 'Kampong Chhnang et Kampong Tralach',
            description:
              'Villages flottants et poteries de Kampong Chhnang, puis balade en char à bœufs à Kampong Tralach selon le niveau de l’eau.',
          },
          en: {
            title: 'Kampong Chhnang and Kampong Tralach',
            description:
              'Floating villages and pottery of Kampong Chhnang, then an ox-cart ride in Kampong Tralach, depending on water levels.',
          },
        },
      },
      {
        day: 3,
        overnightLocation: { fr: 'Phnom Penh', en: 'Phnom Penh' },
        translations: {
          fr: {
            title: 'Phnom Penh',
            description:
              'Palais royal, Pagode d’argent et Musée national ; en option, Tuol Sleng ou les Killing Fields de Choeung Ek.',
          },
          en: {
            title: 'Phnom Penh',
            description:
              'Royal Palace, Silver Pagoda and National Museum; optionally Tuol Sleng or the Choeung Ek Killing Fields.',
          },
        },
      },
      {
        day: 4,
        overnightLocation: { fr: 'À bord', en: 'On board' },
        translations: {
          fr: {
            title: 'Koh Oknha Tey, frontière et Tan Chau',
            description:
              'Visite des tisserands de soie de Koh Oknha Tey, descente du fleuve puis formalités frontalières Cambodge – Vietnam et village de soie de Tan Chau.',
          },
          en: {
            title: 'Koh Oknha Tey, border and Tan Chau',
            description:
              'Visit the silk weavers of Koh Oknha Tey, cruise downriver, then Cambodia–Vietnam border formalities and the silk village of Tan Chau.',
          },
        },
      },
      {
        day: 5,
        overnightLocation: { fr: 'À bord', en: 'On board' },
        translations: {
          fr: {
            title: 'Chau Doc, Sa Dec et Cai Be',
            description:
              'Sampans vers les fermes piscicoles flottantes et villages cham de Chau Doc, puis Sa Dec (la maison de l’Amant de Marguerite Duras) et ateliers de Cai Be.',
          },
          en: {
            title: 'Chau Doc, Sa Dec and Cai Be',
            description:
              'Sampans to the floating fish farms and Cham villages of Chau Doc, then Sa Dec (the house from Marguerite Duras’s The Lover) and the workshops of Cai Be.',
          },
        },
      },
      {
        day: 6,
        overnightLocation: { fr: 'À bord', en: 'On board' },
        translations: {
          fr: {
            title: 'Vinh Long et Cai Be',
            description:
              'Vélo ou marche à travers vergers et ateliers de village, navigation l’après-midi.',
          },
          en: {
            title: 'Vinh Long and Cai Be',
            description:
              'Cycling or walking through orchards and village workshops, with cruising in the afternoon.',
          },
        },
      },
      {
        day: 7,
        overnightLocation: null,
        translations: {
          fr: {
            title: 'My Tho → Hô Chi Minh-Ville',
            description:
              'Sampan à My Tho ou Ben Tre avec thé au miel et dégustation de fruits, puis canal de Cho Gao jusqu’à Hô Chi Minh-Ville et débarquement.',
          },
          en: {
            title: 'My Tho → Ho Chi Minh City',
            description:
              'Sampan ride in My Tho or Ben Tre with honey tea and fruit tasting, then through the Cho Gao canal to Ho Chi Minh City and disembarkation.',
          },
        },
      },
    ],
  },
];

export default tours;
