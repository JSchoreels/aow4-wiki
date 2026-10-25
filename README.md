# Age of Wonders 4 mechanics reference

[Open the mechanics atlas](https://jschoreels.github.io/aow4-wiki/)

The homepage links to the [building catalogue](https://jschoreels.github.io/aow4-wiki/buildings.html), [prerequisite tree](https://jschoreels.github.io/aow4-wiki/building-tree.html), and [stacking explanation](https://jschoreels.github.io/aow4-wiki/mechanics.html). Buildings use their original icons and show matching Infrastructure skills, boost conditions, and nominal discounts with and without a boost.

All 36 common buildings share one category. Food, Gold, Mana, Research, Industrial, and War filters show buildings matching any selected bonus; no selected bonus means all. Filters select buildings, not unlocked skills. Category, culture, search, and sorting controls are shared between the list and tree through the URL.

The default list order is minimum required city level, then building tier, then name. Building cost tiers and Town Hall gates are shown separately. The tree draws building prerequisites from required/supplied property IDs, with alternative suppliers shown as possible routes. Details include full mapped prerequisite groups and other gates, including prerequisites outside the current filters.

Cultural replacements share one building group in both views. Families are inferred from co-suppliers of prerequisite properties at the same building tier and city gate, with at most one member per culture; unrelated alternatives such as Wizard Tower and Vampire Castle stay separate. The current 341 entries form 280 groups, including 19 families with several variants. Group cards show discount and construction-cost ranges; selecting a group compares each variant’s bonuses, boost conditions, and initial/reduced costs. Prerequisite details collapse cultural alternatives into expandable groups. Search includes the family name, and filters apply to individual variants before grouping.

The tree uses a dependency-free column layout with right-angle arrows measured from the displayed cards. Column ordering considers both prerequisites and descendants, retaining the arrangement with fewer crossings; catalogue order breaks ties. Related branches stay together, and links that skip columns travel above the cards. Cultural alternatives within a family share one arrow per dependency; dashed arrows indicate alternatives between families or routes specific to some variants. Minimum city gates remain labels, with Town Hall arrows restricted to the appropriate culture. Card size changes trigger arrow updates.

Infrastructure discounts add together. A building boost then multiplies the remaining gold and production cost by 0.70, giving nominal total discounts of 47.5%, 65%, or 82.5% with one, two, or three matching Infrastructure skills. Whole-resource rounding can change the displayed costs slightly.

The reference assumes all six Infrastructure skills are unlocked. Boosted totals assume the building's boost requirements are met. Other discounts are outside this reference's scope.

Both building views include a savings calculator for the entries matching the active filters. Independently select which Infrastructure bonuses to include and whether to assume building boosts are met. Each bonus row shows its individual gold and production savings; checked rows add to the combined total. The cost to build uses only selected bonuses and applies the 30% building boost where available. Filter changes, including search and culture, recalculate the summary. Calculator choices are preserved in the shared URL and when switching between list and tree.

The bottom of each building card and tree node shows initial and reduced construction costs using the calculator's selected bonuses and boost setting, with original game icons for gold, production, and mana. The aligned rows strike through initial costs and emphasize reduced costs. The displayed total discount and active bonus badges follow the same selection, including an explicit Building boost −30% badge for eligible buildings. Additional resources, such as mana, appear with unchanged costs. These reduced costs use the same calculation as the filtered total.

Hover or focus a building to preview its in-game income and effect descriptions with game resource icons. “Building effects” pins the preview; touch users can tap the building. Tooltips preserve conditional income and special rules, include boost conditions, and link to requirements. The same effects are also included in the building details. Descriptions come from the pinned AoW4 Database export, joined by exact game resource ID; five entries have no effect text in that source and explicitly say so. Source markup is rendered through an allowlist without retaining attributes or executable elements.

Construction costs come from the same pinned AoW4 Database export, joined by exact game resource ID for all 341 source entries. Savings apply only to gold and production; other construction resources remain unaffected and are excluded from the cost line. Values are nominal before whole-resource rounding. Each matching variant is counted once, including alternatives inside a group, so a view containing alternative buildings or several cultures is a catalogue total rather than a single city's construction plan. Card totals and active bonus badges use the selected Infrastructure bonuses and boost setting. Group tooltips and comparisons retain the effects of each matching cultural variant.

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
- `assets/building-families.js`: cultural family mapping and grouped dependency model.
- `assets/building-tree.js`: accessible graph markup, column ordering, and right-angle arrow routing.
- `assets/site.css`: responsive shared styles.
- `source/infrastructure-bonuses.html`: archived source of the original visual.
- `source/requirements-analysis.txt`: prerequisite extraction notes.
- `source/boost-analysis.txt`: supporting analysis.
- `source/import-building-costs.cjs`: imports construction costs from a local copy of the pinned `structure-catalogue.json` export, using exact game resource IDs.
- `source/import-building-effects.cjs`: imports income and effect descriptions from the same export.
- `assets/building-effects.js`: safe rendering and hover, focus, and touch interactions for building effect previews.
- `.nojekyll`: serves the site as plain static files.

GitHub Pages publishes the root of the `main` branch. The site needs no server or build step; building icons load from the pinned AoW4 Database commit through jsDelivr. Filter settings are shareable through URL parameters. The whole tree shares one horizontal and vertical scroll area, sized to keep its scrollbars within the viewport. On desktop, the sticky filter panel scrolls independently when its controls exceed the screen height; on mobile, filters remain in the normal page flow.

Run `node source/check-building-families.cjs` to verify cultural grouping, filter membership, unique arrows, variant-specific routes, and column arrow routing against the catalogue.

## Credits

Age of Wonders 4 and its building artwork belong to Triumph Studios and Paradox Interactive. Extracted building icons are served by the community-maintained [MinionsArt/aow4db](https://github.com/MinionsArt/aow4db) project. This is an unofficial fan reference.
