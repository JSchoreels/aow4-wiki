# Age of Wonders 4 mechanics reference

[Open the mechanics atlas](https://jschoreels.github.io/aow4-wiki/)

The homepage links to the [building catalogue](https://jschoreels.github.io/aow4-wiki/buildings.html), [prerequisite tree](https://jschoreels.github.io/aow4-wiki/building-tree.html), and [stacking explanation](https://jschoreels.github.io/aow4-wiki/mechanics.html). Buildings use their original icons and show matching Infrastructure skills, boost conditions, and nominal discounts with and without a boost.

All 36 common buildings share one category. Food, Gold, Mana, Research, Industrial, and War filters show buildings matching any selected bonus; no selected bonus means all. Filters select buildings, not unlocked skills. Category, culture, search, and sorting controls are shared between the list and tree through the URL.

The default list order is minimum required city level, then building tier, then name. Building cost tiers and Town Hall gates are shown separately. The tree draws building prerequisites from required/supplied property IDs, with alternative suppliers shown as possible routes. Details include full mapped prerequisite groups and other gates, including prerequisites outside the current filters.

Infrastructure discounts add together. A building boost then multiplies the remaining gold and production cost by 0.70, giving nominal total discounts of 47.5%, 65%, or 82.5% with one, two, or three matching Infrastructure skills. Whole-resource rounding can change the displayed costs slightly.

The reference assumes all six Infrastructure skills are unlocked. Boosted totals assume the building's boost requirements are met. Other discounts are outside this reference's scope.

## Sources and verification

- Building tags and boost-entry links were read from the installed game resource packages on 25 October 2026.
- The stacking order was traced through the engine bundled with the game's resource editor. This is static analysis, not a measurement from a running save.
- Building names, icon IDs, and boost requirement labels use the [AoW4 Database](https://minionsart.github.io/aow4db/HTML/) export at [commit df99314](https://github.com/MinionsArt/aow4db/tree/df99314bf82c1bdeef51206a7257d7bb125b35a8). All 348 catalogue entries matched local definitions, and all 123 exported boost-eligibility flags agreed with their local boost-entry links.
- Required building properties, city gates, domain requisites, and cost tiers are decoded from local definitions. [Prerequisite analysis notes](source/requirements-analysis.txt) describe the mapping and limitations.
- Equivalent variants are merged when their bonuses, boost requirements, and required properties match. Unused and iconless entries are omitted, leaving 341 display entries. Culture, research, terrain, and other gates can still limit the possible prerequisite routes.
- [Technical analysis notes](source/boost-analysis.txt) include the resource IDs and engine addresses used to verify the boost interaction.

## Files and publishing

- `index.html`: homepage linking to the reference pages.
- `buildings.html`: filtered building catalogue.
- `building-tree.html`: building dependency graph.
- `mechanics.html`: stacking rules, examples, and source explanations.
- `assets/buildings-data.js`: generated building and prerequisite data.
- `assets/buildings.js`: shared filtering, sorting, details, and graph renderer.
- `assets/site.css`: responsive shared styles.
- `source/infrastructure-bonuses.html`: archived source of the original visual.
- `source/requirements-analysis.txt`: prerequisite extraction notes.
- `source/boost-analysis.txt`: supporting analysis.
- `.nojekyll`: serves the site as plain static files.

GitHub Pages publishes the root of the `main` branch. The site needs no server or build step; building icons load from the pinned AoW4 Database commit through jsDelivr. Filter settings are shareable through URL parameters. Wide dependency chains scroll inside their own panel on smaller screens.

## Credits

Age of Wonders 4 and its building artwork belong to Triumph Studios and Paradox Interactive. Extracted building icons are served by the community-maintained [MinionsArt/aow4db](https://github.com/MinionsArt/aow4db) project. This is an unofficial fan reference.
