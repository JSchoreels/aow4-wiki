# Age of Wonders 4 mechanics reference

[Open the building-discount visual](https://jschoreels.github.io/aow4-wiki/)

The visual shows which of the six Infrastructure empire skills apply to each building, using its resource-category tags. It includes building icons, boost requirements, and nominal discounts with and without a building boost. Expand a category to browse its buildings.

Infrastructure discounts add together. A building boost then multiplies the remaining gold and production cost by 0.70, giving nominal total discounts of 47.5%, 65%, or 82.5% with one, two, or three matching Infrastructure skills. Whole-resource rounding can change the displayed costs slightly.

The reference assumes all six Infrastructure skills are unlocked. Boosted totals assume the building's boost requirements are met. Other discounts are outside this reference's scope.

## Sources and verification

- Building tags and boost-entry links were read from the installed game resource packages on 25 October 2026.
- The stacking order was traced through the engine bundled with the game's resource editor. This is static analysis, not a measurement from a running save.
- Building names, icon IDs, and boost requirement labels use the [AoW4 Database](https://minionsart.github.io/aow4db/HTML/) export at [commit df99314](https://github.com/MinionsArt/aow4db/tree/df99314bf82c1bdeef51206a7257d7bb125b35a8). All 348 catalogue entries matched local definitions, and all 123 exported boost-eligibility flags agreed with their local boost-entry links.
- Equivalent building variants are merged when their bonuses and boost requirements match. Unused and iconless entries are omitted.
- [Technical analysis notes](source/boost-analysis.txt) include the resource IDs and engine addresses used to verify the boost interaction.

## Files and publishing

- `index.html`: standalone visual with the required styles and interaction runtime included.
- `source/infrastructure-bonuses.html`: editable source fragment for the visual.
- `source/boost-analysis.txt`: supporting analysis.
- `.nojekyll`: serves the site as plain static files.

GitHub Pages publishes the root of the `main` branch. The site needs no server or build step; building icons load from the pinned AoW4 Database commit through jsDelivr. The standalone runtime stores expanded categories locally in the browser.

## Credits

Age of Wonders 4 and its building artwork belong to Triumph Studios and Paradox Interactive. Extracted building icons are served by the community-maintained [MinionsArt/aow4db](https://github.com/MinionsArt/aow4db) project. This is an unofficial fan reference.
