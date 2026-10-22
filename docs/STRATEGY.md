# Beyond the Mekong — operator analysis and site architecture

Based on multi-AI research (Gemini, Perplexity, ChatGPT, DeepSeek; sources include sambahq.com, atlasperk.com, liquidspark.com, atout-france.fr). Personas are working hypotheses to validate with real enquiries.

## The operator: pains, needs, objectives

| Pain | Need | Site objective |
| --- | --- | --- |
| Dependence on OTA commissions | More direct, higher-margin bookings | Strong brand, direct enquiry path |
| Generic "price for 2 weeks?" enquiries | Qualify dates, party, budget early | Guided 3-step form |
| Trust deficit (distant, high-value trip) | Prove legitimacy and protection | Legal identity, policies, reviews, named team |
| Differentiation vs OTAs / big DMCs | Show local expertise | Original itineraries, small groups, local guides |
| Quoting workload | Reusable itineraries, fast triage | Modular tour pages, FAQ, admin pipeline |
| FR/EN content drift | One workflow, two polished versions | Separate `/fr` `/en` URLs, shared data model |

## Customers

- **Couple (45-70, FR):** authentic, comfortable, no tourist traps. Needs sample itineraries, clear pricing, a named contact.
- **Independent traveller (25-40):** flexibility and price transparency. Needs clear inclusions, mobile contact.
- **Family:** logistics handled. Needs realistic pacing, short transfers, safety info.
- **Solo / small group:** meet people, avoid single supplements. Needs confirmed departures and group size.
- **Specialist / slow traveller:** depth over breadth. Needs specialist pages and customisation.
- **Reassurance seeker (a state, not a segment):** compares operators, fears prepaying. Needs legal identity, terms, a fast human reply.

## Architecture verdict

Confirmed, with two corrections:

1. **Booking is enquiry-led, not checkout** (hybrid in production: online deposit later for fixed departures). Implemented: departures with status, 3-step enquiry, WhatsApp as follow-up channel, not as the booking system.
2. **Two clicks from home to any trip**, always-visible enquiry/WhatsApp action.

Implemented in the demo: Home, Tours (country and difficulty filters), Tour page (itinerary, departures, weather, price note, CTA), Book, Contact, FAQ, About (responsible travel, legal), Admin.

Recommended next, not in the demo: destination hubs per country, a travel-styles filter (couples, families, food), a "Tailor-made" page as the main conversion page, reviews aggregated from a real source, a journal for SEO/GEO, hreflang and JSON-LD (`TouristTrip`), a legal/terms page. Real credentials (Atout France number, insurance) must only be shown when real.
