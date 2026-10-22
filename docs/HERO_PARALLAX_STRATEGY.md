# Hero immersif : scène en couches, parallax et rendu WebGL

Ce document explique comment le hero de Beyond the Mekong est produit, de l'image source jusqu'au rendu, et consigne le problème de scintillement rencontré et sa résolution. Il sert de référence pour reproduire la méthode sur un autre projet.

Fichiers concernés :

| Fichier | Rôle |
| --- | --- |
| `scripts/cut-hero-layers.py` | Découpe des calques générés, export WebP |
| `public/hero/*.webp`, `grain.png` | Les 7 calques et la tuile de grain |
| `src/components/HeroScene.tsx` | **Le rendu : un seul canvas WebGL** (calques, ciel, eau, caméra, parallax) |
| `src/components/Hero.tsx` | Section du hero : canvas, brume, oiseaux, dégradés, texte |
| `src/lib/parallaxModel.ts` | Modèle de caméra (profondeurs, lois de projection) |
| `src/lib/smoothScroll.ts` | Lenis branché sur le ticker GSAP |
| `src/lib/heroFlags.ts` | Interrupteurs de diagnostic `?hero=` |
| `src/components/SiteHeader.tsx`, `src/lib/heroLuminance.ts` | Navbar adaptative |
| `design/hero-source/` | Images générées, sources des calques |

## 1. Principe

Une scène unique (point de vue depuis une barque) est découpée en **7 calques transparents**, dessinés du plus lointain au plus proche. Chaque calque se déplace selon sa profondeur : c'est la différence de mouvement entre les plans qui crée la profondeur.

| Ordre (fond → avant) | Calque | Contenu | Plan |
| --- | --- | --- | --- |
| 1 | `sky` | Ciel et soleil (shader) | Fond |
| 2 | `p4` | Collines lointaines dans la brume | Plan 4 |
| 3 | `water` | Eau (shader, plan horizontal) | Plan 1 |
| 4 | `p3` | Îlot pointu à droite du soleil | Plan 3 |
| 5 | `p2` | Groupe de pitons à gauche, avec brume | Plan 2 |
| 6 | `p1` | Falaises qui encadrent la scène | Plan 1 |
| 7 | `boat` | Barque, femme, rame | Plan 1 |

Le **plan 1** est le plus proche (barque, eau, ciel, falaises de cadre) et le **plan 4** le plus lointain. L'eau est derrière les îles dans l'ordre de dessin, car les îles sont coupées à la ligne d'eau et doivent la recouvrir.

## 2. Produire les calques

### 2.1 Génération

1. Partir d'une image de référence photoréaliste.
2. Générer une version « nettoyée » : retirer tout ce qui ne doit pas exister dans la scène (ici, maisons flottantes et petites barques).
3. À partir de cette image, générer **un calque par appel**, chacun avec la même image en référence et la consigne « SAME position and scale as the reference ».
   - Calques de fond plein cadre : le ciel seul, l'eau seule.
   - Calques d'éléments : chaque élément sur un fond vert uni (`#00FF00`), sans ombre sur le fond.

Conseils tirés de l'expérience :

- Les modèles d'image isolent mal un élément précis (« seulement l'îlot de droite »). Demander plutôt un groupe d'éléments contigus et **découper ensuite par géométrie** (voir 2.3).
- Un calque isolé n'est pas garanti : une génération a produit une scène entière au lieu d'un plan. Prévoir de re-générer ou de recadrer.
- Garder les sources en PNG dans `design/hero-source/` pour pouvoir relancer la découpe.

### 2.2 Détourage (chroma key)

`scripts/cut-hero-layers.py` transforme le vert en transparence :

- Le canal alpha vient de l'écart entre le vert et les deux autres canaux, avec un adoucissement des bords.
- Une érosion de quelques pixels et un flou léger évitent le liseré vert.
- Un **despill** corrige les pixels de bord uniquement, pour ne pas ternir le feuillage naturellement vert.
- L'image est agrandie de 1024 à 1920 px (Lanczos plus un léger accentuateur).
- Export en **WebP** avec alpha (`quality` 80 à 84).

### 2.3 Séparer les plans par la géométrie

Quand deux plans sont fusionnés dans la même découpe (ici l'îlot et la grande falaise), on les sépare avec des masques :

- `box_mask` : rectangle adouci, pour colonnes et bandes.
- `poly_mask` : polygone adouci, pour suivre une arête naturelle (`CLIFF_EDGE` suit la limite entre l'îlot et la falaise, lue sur l'image).
- Le calque situé derrière **déborde légèrement** sous celui de devant (l'îlot passe de 3 % sous la falaise) : pendant le parallax, aucune fente ne s'ouvre entre les deux.

### 2.4 Cas particuliers

- **Ciel** : la source a le soleil trop bas. Il est comprimé en hauteur (placé de −3 % à 54 % de la scène) pour que le soleil reste au-dessus de l'horizon.
- **Eau** : recadrée à partir de l'horizon (55 % de la hauteur) avec 40 px de fondu en haut pour se fondre dans le ciel.
- **Collines lointaines** : adoucies (flou et opacité 0,75) pour se lire comme de la brume, et non comme un bloc.

## 3. Architecture du rendu : un seul canvas WebGL

Tout le hero est dessiné par `HeroScene.tsx` dans **un unique canvas** (WebGL 1, sans bibliothèque). Il n'y a pas de couches DOM.

- Chaque calque est un quad texturé, dessiné du fond vers l'avant avec un mélange alpha prémultiplié.
- Le vertex shader applique, par calque : une translation de parallaxe, puis une dilatation autour du point de fuite (section 5).
- Le ciel et l'eau passent par un fragment shader (ondulations, reflets, plan d'eau par pixel) ; les autres calques par un fragment shader de simple lecture de texture.
- La scène (ratio 1920:1072) couvre le canvas avec **10 % de surplus**, centrée, pour laisser de la marge aux calques qui se déplacent.
- Le canvas reste masqué tant que les 7 textures ne sont pas chargées, puis tout apparaît **d'un coup** : pas d'animation d'ouverture et pas d'apparition partielle.
- Résolution plafonnée (`devicePixelRatio` à 1,5 au plus, 1 sur les machines à 4 cœurs ou moins), rendu suspendu quand le hero est hors écran ou l'onglet masqué.
- Repli : sans WebGL ou si le contexte est perdu, empilement statique des mêmes images. Avec `prefers-reduced-motion`, une seule image fixe.
- Restent en HTML, par-dessus le canvas : la brume, les oiseaux, le dégradé de contraste, la vignette, le grain et le texte.

Pourquoi un seul canvas plutôt que des couches DOM : voir la section 9.

## 4. Mouvements autres que le parallax

| Élément | Mouvement |
| --- | --- |
| Brume | Dérive horizontale lente (dégradés CSS, sans filtre de flou) |
| Oiseaux | Traversée de l'écran et battement vertical |
| Eau | Ondulations par déplacement de la texture, d'amplitude croissante vers le spectateur, plus des scintillements de soleil sur les zones claires |
| Ciel | Dérive lente, déformation douce, légère « respiration » de la lumière |
| Texte | Il remonte et s'estompe pendant que le hero défile |

Il n'y a pas d'animation d'ouverture. Une ancienne version révélait les plans un par un avec une timeline GSAP ; elle a été retirée pour que la profondeur vienne uniquement de la souris et du scroll.

## 5. Parallax : un modèle de caméra, pas des réglages à la main

Chaque calque déclare seulement sa **profondeur Z** (en mètres) et `src/lib/parallaxModel.ts` en déduit le mouvement par la projection d'une caméra sténopé (distance focale `f`, champ de 68°). La caméra est celle d'un passager de la barque : la souris l'incline de quelques centimètres, le scroll la fait avancer.

Ce que dit la physique, et ce qui est appliqué :

| Mouvement de caméra | Loi | Effet appliqué |
| --- | --- | --- |
| Translation latérale `dx` | décalage `u = -f·dx / Z`, proportionnel à `1/Z` | plus un objet est loin, moins il bouge |
| Convergence sur une profondeur `Zf` | `u = f·dx·(1/Zf − 1/Z)` | les objets plus proches que `Zf` glissent dans un sens, les plus lointains dans l'autre |
| Rotation (tangage) | décalage identique à toute profondeur | aucun parallaxe ; sert au balancement de la barque |
| Avancée `dz` | dilatation radiale depuis le point de fuite, `s = Z / (Z − dz)` | un objet loin du point de fuite se déplace plus ; les objets lointains ne grossissent presque pas |
| Plan d'eau (sol) | `Z = f·H / r`, `r` = distance sous l'horizon | l'inverse de la profondeur est linéaire en `r` : l'horizon ne bouge pas, le bas bouge le plus |
| Ciel (infini) | `1/Z → 0` | quasi aucun décalage de translation |

Profondeurs retenues (mètres) :

| Calque | Z |
| --- | --- |
| barque (pont attaché à la caméra) | 10 (artistique : en réalité environ 4 m, mais la barque suit la caméra et doit rester discrète) |
| plan 1, falaises de cadre | 30 |
| plan 2, pitons à gauche | 80 |
| plan 3, îlot à droite | 150 |
| plan 4, collines | 450 |
| ciel | 5000 (quasi infini) |
| eau | plan horizontal, œil à 1,4 m, traité par pixel dans le shader |

Paramètres de la caméra : balancement maximal ±0,25 m en x et ±0,12 m en y (la barque bouge d'environ 20 px au bord de l'écran), convergence à 35 m, avancée de 10 m sur toute la hauteur du hero.

Résultat mesuré dans le navigateur (souris à droite de l'écran) :

| Calque | Décalage |
| --- | --- |
| barque | −20 px |
| plan 1 | −1,5 px |
| plan 2 | +4,5 px |
| plan 3 | +6 px |
| plan 4 | +7,5 px |
| ciel | +8 px |

La barque et l'îlot de droite partent donc en sens opposés, avec des amplitudes très différentes. Avec le scroll, les échelles obtenues sont : plan 1 ×1,50, plan 2 ×1,14, plan 3 ×1,07, plan 4 ×1,02, ciel ×1,00. Comme la dilatation part du point de fuite, un élément à droite et un élément à gauche s'écartent dans des directions opposées.

Le **balancement** de la barque est lui aussi physique : la caméra est fixée à la barque, donc c'est le monde qui tangue. Le tangage décale tous les plans à l'identique, le soulèvement (`f·dh / Z`) décale davantage les plans proches. Le roulis a été retiré : faire tourner de grands calques transparents d'une fraction de degré différente à chaque image fait scintiller les bords fins (rame, perches, contours de roche).

Limite assumée : un balancement réaliste de la tête produit très peu de mouvement sur des îles lointaines. L'amplitude est donc agrandie par **un seul coefficient global**, la même loi s'appliquant à tous les calques. Les recherches donnent 20 à 60 px de déplacement maximal sur ordinateur comme ordre de grandeur pour ce type d'effet.

La souris est lissée (7 % par image). Le calcul s'arrête quand le hero est sorti de l'écran.

## 6. Navbar adaptative

La navbar est visible dès le départ. Sa couleur de texte est choisie par **contraste WCAG mesuré** :

- Sur le hero : la luminance de chaque bande horizontale de la scène composée est calculée une fois sur un petit canvas (`heroLuminance.ts`).
- Ailleurs : la couleur de fond lue sous la barre (`elementsFromPoint`).
- Le texte est blanc ou sombre selon le meilleur ratio, avec une petite hystérésis (0,6) pour éviter le clignotement.
- Le ratio est exposé dans l'attribut `data-contrast` du header, pratique pour vérifier.
- Au-dessus du hero, le « verre » est un fond sombre semi-transparent **sans `backdrop-filter`** (voir section 9) ; le flou n'est utilisé que sur le contenu clair.

## 7. Accessibilité et performance

- `prefers-reduced-motion` : aucune animation, aucun Lenis, une image fixe.
- Poids total des calques : environ 280 Ko (WebP).
- Grain statique en tuile PNG, sans mélange, et vignette : ils masquent le flou d'agrandissement et les bandes de couleur.
- Texte du hero resserré sur la gauche et dégradé sombre en dessous, pour garder un contraste lisible.
- Lenis (scroll lissé, `lerp` 0,09) est branché sur le ticker GSAP, avec le lag smoothing désactivé, pour qu'une seule boucle pilote le scroll et le rendu.

## 8. Recette pour un nouveau projet

1. Choisir une scène avec de vrais plans successifs (premier plan, 3 ou 4 plans intermédiaires, fond).
2. Générer une image de référence, la nettoyer des éléments indésirables.
3. Générer un calque par plan avec cette référence (fond vert pour les éléments, ciel et eau seuls en plein cadre).
4. Détourer avec le script, séparer les plans fusionnés par masques, faire déborder les calques arrière sous ceux de devant.
5. Attribuer une profondeur Z en mètres à chaque calque dans `parallaxModel.ts`.
6. **Dessiner la scène dans un seul canvas WebGL** (une texture par calque) plutôt qu'avec des couches DOM animées.
7. Ajouter shaders eau et ciel, grain et vignette sans mélange.
8. Tester : scroll lent au trackpad dans Chrome, Edge, Brave et Safari, redimensionnement, `prefers-reduced-motion`, et mobile (souris désactivée).

Limites connues :

- Les images générées font 1024 px de large, agrandies à 1920 : prévoir des rendus plus grands avant la production.
- La séparation îlot / falaise suit un tracé lu sur l'image : un léger angle reste visible en haut de la falaise.
- La scène source est la baie d'Ha Long : à remplacer pour illustrer réellement le Mékong.

## 9. Incident : rectangles orange qui clignotent au scroll

### Symptôme

Pendant le scroll, des **rectangles orange pleins aux bords nets** apparaissaient par endroits, en alternance, dans le hero (d'abord décrits comme des « micro-disparitions » puis comme des « halos orange »). Une capture vidéo de l'écran a permis de les voir image par image : un rectangle près de l'horizon à droite du chapeau, puis un autre sur le bord droit.

### Cause

Ce sont des **dalles de rendu** (tiles) que Chromium n'avait pas rasterisées à temps. L'architecture de l'époque empilait 7 grandes couches DOM (`will-change: transform`), dont plusieurs étaient déplacées **et agrandies à chaque image** (dilatation jusqu'à ×1,5). Quand une dalle d'une couche manque, le navigateur affiche ce qui est derrière : ici le ciel orange, d'où la couleur des rectangles. C'est le phénomène documenté de « checkerboarding » sous pression de mémoire GPU (le défaut a été observé dans Brave sur macOS).

### Recherche

Une recherche croisée (4 IA, avec des liens vers des tickets Chromium) a classé les causes possibles, de la plus à la moins probable :

1. `backdrop-filter: blur()` sur un en-tête fixe au-dessus de contenu qui bouge (tickets Chromium 41471914 et 414525204).
2. `mix-blend-mode` sur un grand calque au-dessus de couches animées et de canvas WebGL.
3. Trop de couches promues par `will-change: transform` : pression sur la mémoire GPU, dalles non rasterisées.
4. Changements d'échelle (`scale`) pilotés par script, qui forcent une nouvelle rasterisation.
5. Canvas WebGL placé sous des ancêtres transformés ou agrandis.
6. Fond SVG `feTurbulence` coûteux à peindre.
7. Environnement (pilote GPU, Brave) : à tester, pas une solution.

### Ce qui ne l'a pas résolu

Ces corrections étaient justifiées et ont été gardées, mais **le défaut persistait** :

- plus de `backdrop-filter` au-dessus du hero (faux verre : fond sombre semi-transparent) ;
- grain en tuile PNG simple, sans `mix-blend-mode` ;
- canvas du ciel et de l'eau sans ancêtre transformé (scène centrée par des marges) ;
- une seule écriture de style par calque et par image, arrondi au quart de pixel, suppression du roulis, décodage synchrone des images ;
- au préalable : un seul ticker au lieu de plusieurs boucles, `force3D`, pas de flou CSS sur éléments animés, pré-décodage des images.

### Résolution

Le coupable était la cause n° 3 : **le nombre de grandes couches DOM transformées**. La correction de fond a été de supprimer ces couches : le hero est dessiné dans **un seul canvas WebGL** (section 3). Sans couches DOM, il n'existe plus de dalles par calque qui puissent manquer, et le ciel ne peut plus transparaître. Le rendu visuel et le modèle de parallax sont inchangés. Le défaut a disparu après ce changement (confirmé sur le navigateur concerné).

### Leçons

- Pour une scène de plusieurs grandes images qui bougent et s'agrandissent à chaque image, **un canvas (WebGL ou 2D) est plus fiable que des couches DOM** : le compositeur du navigateur n'a pas de dalles à gérer.
- Une **capture vidéo** image par image vaut mieux que toute description : elle a montré la forme exacte du défaut (rectangles pleins) et orienté vers la bonne cause.
- Isoler d'abord les suspects les plus probables selon les sources, mais ne pas s'arrêter si le défaut persiste : une cause plus structurelle peut se cacher derrière.
- Ne pas appeler `loseContext()` au démontage d'un canvas WebGL sous React StrictMode : le remontage réutilise le même canvas et un contexte perdu ne peut pas être recréé.

### Diagnostic en cas de récidive

Ajouter `?hero=` à l'URL avec une liste séparée par des virgules, par exemple `/fr?hero=noblur,nograin` :

| Option | Effet |
| --- | --- |
| `noblur` | en-tête sans `backdrop-filter` |
| `nograin` | pas de grain |
| `nocontain` | pas de `contain: layout paint` sur le hero |
| `noscale` | pas de dilatation au scroll (translation seule) |

Tester aussi dans Chrome, Edge et Safari pour savoir si le navigateur ou le pilote GPU est en cause.

## 10. Second décor : Cambodge (Angkor Wat)

Un bouton à droite du hero bascule entre deux décors ; la barque et la femme restent en place.

- `src/lib/heroScenes.ts` : liste des calques par décor (`halong`, `cambodia`) + barque partagée, dessinée en dernier. Le décor Cambodge a son horizon à 50 % dans l'image source : ses calques sont agrandis de 1,1 autour de l'horizon (`rect` `[-0.05, 0, 1.1, 1.1]`) pour tomber sur l'horizon commun de 55 %.
- `scripts/cut-hero-layers-cambodia.py` : découpe (ciel, eau, `p3` temple z150, `p2` palmiers à gauche z80, `p1` arbres à droite z30). Sources dans `design/hero-source/kh_*`. Le calque temple généré contenait aussi l'eau et les arbres voisins : il est isolé par `box_mask`.
- Pas de bug d'affichage au changement : les textures des deux décors sont toutes envoyées au GPU avant que le bouton ne s'active (premier décor d'abord, puis l'autre au repos du navigateur, une texture par image). Basculer ne change que la liste de calques dessinés, avec un fondu enchaîné de 0,7 s dans le shader (uniform `fade`), sans chargement ni recréation du contexte WebGL.
- La navbar adaptative suit le décor (`setHeroScene` dans `heroLuminance.ts`).

### 10.1 Troisième décor : Laos (Luang Prabang)

- Calques : ciel (étendu vers le haut dans le fichier, soleil à mi-hauteur de la source), `p4` montagnes brumeuses (découpées dans l'image propre `la_clean.png` par la couleur : tout ce qui n'est pas ciel chaud, car le calque généré était recadré), `p3` colline au stupa doré (tuile détaillée), eau, et arbres de berge `kh/p1` partagés avec le Cambodge. Découpe : `scripts/cut-hero-layers-laos.py`.
- Le bouton fait défiler les décors en boucle (`SCENE_ORDER` : Vietnam, Cambodge, Laos), avec le libellé du décor suivant.
- Tuiles détaillées : `scripts/register-tiles.py` vérifie le calage de chaque tuile régénérée. Une tuile mal calée (échelle ≠ 1, corrélation faible) doit être régénérée, pas utilisée.
