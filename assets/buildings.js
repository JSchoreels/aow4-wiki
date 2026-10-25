/* Static catalogue with cultural building families and column prerequisite layout. */
(() => {
  'use strict';
  const app = document.querySelector('#building-app');
  if (!app) return;
  const buildings = window.AOW_BUILDINGS;
  if (!Array.isArray(buildings)) {
    app.innerHTML = '<p class="load-error">The building data could not load. Please reload this page.</p>';
    return;
  }
  const view = document.body.dataset.view;
  const byKey = new Map(buildings.map(b => [b.key, b]));
  const families = window.AOWBuildingFamilies.createFamilies(buildings);
  let displayedFamilies = new Map();
  const iconBase = 'https://cdn.jsdelivr.net/gh/MinionsArt/aow4db@df99314bf82c1bdeef51206a7257d7bb125b35a8/Icons/UpgradeIcons/';
  const skills = [
    {id:'food',label:'Food',affinity:'Nature',color:'food'},
    {id:'gold',label:'Gold',affinity:'Order',color:'gold-skill'},
    {id:'mana',label:'Mana',affinity:'Astral',color:'mana'},
    {id:'research',label:'Research',affinity:'Shadow',color:'research'},
    {id:'industrial',label:'Industrial',affinity:'Materium',color:'industrial'},
    {id:'war',label:'War',affinity:'Chaos',color:'war'}
  ];
  const categories = ['Common buildings','Culture buildings','Tome buildings','Fortifications & stability','Wizard’s Tower','Vampire Castle','Hero & utility buildings','Other special structures','Province improvements'];
  const cultures = [...new Set(buildings.map(b => b.culture).filter(Boolean))].sort();
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roman = n => ['—','I','II','III','IV'][n] || '—';
  const pct = n => `${Number(n.toFixed(1))}%`;
  const amount = n => n.toLocaleString('en-US',{maximumFractionDigits:3});
  const discount = b => b.skills.length * 25;
  const boosted = b => 100 - (100 - discount(b)) * .7;
  const params = new URLSearchParams(location.search);
  const state = {
    category: categories.includes(params.get('category')) ? params.get('category') : 'all',
    culture: cultures.includes(params.get('culture')) ? params.get('culture') : '',
    skills: new Set((params.get('skills') || '').split(',').filter(s => skills.some(x => x.id === s))),
    q: params.get('q') || '',
    sort: ['city','tier','name','discount'].includes(params.get('sort')) ? params.get('sort') : 'city',
    savingsBoosted: params.get('savingsBoosted') === '1',
    savingsSkills: new Set(params.has('savingsSkills') ? params.get('savingsSkills').split(',').filter(id => skills.some(s => s.id === id)) : skills.map(s => s.id))
  };
  const option = (value,label,current) => `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(label)}</option>`;
  app.innerHTML = `<div class="workspace"><aside class="filters" aria-label="Building filters"><h2>Find a building</h2><label class="field"><span>Search by name</span><input id="search" type="search" placeholder="e.g. Workshop" value="${esc(state.q)}"></label><fieldset><legend>Infrastructure bonus</legend><div class="skill-options">${skills.map(s => `<label class="skill-toggle" style="--tone:var(--${s.color})" title="${s.label} Infrastructure · ${s.affinity}"><input type="checkbox" value="${s.id}"${state.skills.has(s.id) ? ' checked' : ''}><span>${s.label}</span><i class="dot" aria-hidden="true"></i></label>`).join('')}</div><p class="filter-help">Select a bonus to see matching buildings. Several selected = matches any. None selected = all bonuses.</p></fieldset><div class="filter-selects"><label class="field"><span>Building category</span><select id="category">${option('all','All buildings',state.category)}${categories.map(c => option(c,c,state.category)).join('')}</select></label><label class="field"><span>Culture</span><select id="culture">${option('','All cultures',state.culture)}${cultures.map(c => option(c,'Shared + '+c,state.culture)).join('')}</select></label></div><label class="field"><span>Sort buildings</span><select id="sort">${option('city','City level → building tier',state.sort)}${option('tier','Building tier → city level',state.sort)}${option('name','Name: A–Z',state.sort)}${option('discount','Largest discount first',state.sort)}</select></label><button class="reset" type="button">Reset filters</button></aside><section class="results" aria-label="Building results"><div class="toolbar"><span id="result-count" class="result-count" role="status" aria-live="polite"></span><div class="view-switch" aria-label="Display view"><a id="list-link" href="buildings.html"${view === 'list' ? ' aria-current="page"' : ''}>List</a><a id="tree-link" href="building-tree.html"${view === 'tree' ? ' aria-current="page"' : ''}>Tree</a></div></div><p class="explain" id="view-explanation"></p><div id="results"></div></section></div><dialog id="building-dialog" aria-labelledby="dialog-title"><button type="button" class="dialog-close" aria-label="Close building details">Close ×</button><div id="dialog-content"></div></dialog>`;
  const results = app.querySelector('#results');
  const savings = document.createElement('section');
  savings.className = 'savings';
  savings.setAttribute('aria-labelledby','savings-title');
  savings.innerHTML = `<div class="savings-heading"><h2 id="savings-title">Infrastructure savings in this view</h2><label class="savings-boost"><input type="checkbox" id="savings-boosted"${state.savingsBoosted ? ' checked' : ''}> With building boosts</label></div><p class="filter-help">Choose the bonuses to include in the calculation. Each saves 25% on its matching buildings. These choices leave the building filters unchanged.</p><div class="savings-table-wrap"><table><caption class="sr-only">Construction resources saved by each Infrastructure bonus for the current filters</caption><thead><tr><th scope="col">Include bonus</th><th scope="col">Buildings</th><th scope="col">Gold saved</th><th scope="col">Production saved</th></tr></thead><tbody>${skills.map(s => `<tr data-savings="${s.id}"><th scope="row" style="--tone:var(--${s.color})"><label><input type="checkbox" value="${s.id}"${state.savingsSkills.has(s.id) ? ' checked' : ''}> ${s.label} <small>−25%</small></label></th><td data-count></td><td data-gold></td><td data-production></td></tr>`).join('')}</tbody><tfoot><tr id="savings-total"><th scope="row">Selected bonuses</th><td data-count></td><td data-gold></td><td data-production></td></tr></tfoot></table></div><p class="savings-cost" id="savings-cost"></p><p class="filter-help" id="savings-note"></p>`;
  results.before(savings);
  const dialog = app.querySelector('dialog');
  const effects = window.AOWBuildingEffects.create({root:app,buildings,iconBase,onInspect:inspect,getFamily:key=>displayedFamilies.get(key)});
  let resizeObserver;
  let drawFrame;
  const query = () => {
    const p = new URLSearchParams();
    if (state.category !== 'all') p.set('category',state.category);
    if (state.culture) p.set('culture',state.culture);
    if (state.skills.size) p.set('skills',skills.filter(s => state.skills.has(s.id)).map(s => s.id).join(','));
    if (state.q) p.set('q',state.q);
    if (state.sort !== 'city') p.set('sort',state.sort);
    if (state.savingsBoosted) p.set('savingsBoosted','1');
    if (state.savingsSkills.size !== skills.length) p.set('savingsSkills',skills.filter(s => state.savingsSkills.has(s.id)).map(s => s.id).join(','));
    return p.size ? '?'+p.toString() : '';
  };
  const compare = (a,b) => {
    const city = (a.cityTier ?? 99) - (b.cityTier ?? 99);
    const tier = (a.tier ?? 99) - (b.tier ?? 99);
    const name = a.name.localeCompare(b.name) || a.origin.localeCompare(b.origin) || a.key.localeCompare(b.key);
    if (state.sort === 'name') return name;
    if (state.sort === 'discount') return discount(b)-discount(a) || city || tier || name;
    if (state.sort === 'tier') return tier || city || name;
    return city || tier || name;
  };
  const matches = b => (state.category === 'all' || b.group === state.category)
    && (!state.culture || !b.culture || b.culture === state.culture)
    && (!state.skills.size || b.skills.some(s => state.skills.has(s)))
    && (!state.q || `${b.name} ${b.origin} ${families.byMember.get(b.key).name}`.toLocaleLowerCase().includes(state.q.toLocaleLowerCase()));
  const image = b => `<img class="building-icon" src="${iconBase+esc(b.icon)}.png" alt="${esc(b.name)} icon" loading="lazy" decoding="async" width="58" height="58">`;
  const badges = (b,selected=false) => (b.skills.length ? b.skills.map(id => {
    const s = skills.find(s => s.id === id);
    return `<span class="skill-badge${selected && !state.savingsSkills.has(id) ? ' inactive' : ''}" style="--tone:var(--${s.color})" title="${s.label} Infrastructure · ${s.affinity}: −25% gold and production">${s.label} −25%</span>`;
  }).join('') : '<span class="no-skills">No Infrastructure bonus</span>') + (selected && b.boostable ? `<span class="skill-badge boost-badge${state.savingsBoosted ? '' : ' inactive'}" style="--tone:var(--gold)" title="Applies after Infrastructure bonuses when the boost condition is met: ${esc(b.boostRequirement)}">Building boost −30%</span>` : '');
  const tiers = b => `<div class="tiers">${b.cityTier ? `<span class="tier" title="Minimum required Town Hall level, including building prerequisites">City ${roman(b.cityTier)}</span>` : '<span class="tier">Province improvement</span>'}${b.tier ? `<span class="tier" title="Building tier from its cost definition">Building tier ${roman(b.tier)}</span>` : ''}</div>`;
  const selectedMultiplier = b => (1-b.skills.filter(id => state.savingsSkills.has(id)).length*.25) * (state.savingsBoosted && b.boostable ? .7 : 1);
  const selectedDiscount = b => 100*(1-selectedMultiplier(b));
  const selectionLabel = b => state.savingsBoosted && b.boostable ? 'total with boost' : 'selected bonuses';
  const reducedCost = (b,resource) => {
    const initial = b.cost[resource] || 0;
    if (!['gold','production'].includes(resource)) return initial;
    return initial * selectedMultiplier(b);
  };
  const costLabels = {gold:'Gold',production:'Production',mana:'Mana',warspoils:'War Spoils',embalmedsacrifice:'Embalmed Sacrifices',wonderstone:'Wonderstone'};
  const resourceLabel = resource => `<span class="cost-resource">${['gold','production','mana'].includes(resource) ? `<img class="resource-icon" src="${iconBase.replace('UpgradeIcons/','Text/')+resource}.png" alt="" width="25" height="25" loading="lazy" decoding="async">` : ''}<span>${esc(costLabels[resource] || resource)}</span></span>`;
  const buildingCosts = b => {
    if (!b.cost) return '<span class="building-costs">Construction costs unavailable</span>';
    return `<span class="building-costs" role="table" aria-label="Construction costs using selected bonuses and boost setting" title="Reduced costs use the selected Infrastructure bonuses and building boost setting, before whole-resource rounding."><span class="cost-row cost-heading" role="row"><span role="columnheader">Cost</span><span role="columnheader">Initial</span><span role="columnheader">Reduced</span></span>${Object.entries(b.cost).filter(([resource,value]) => value || ['gold','production'].includes(resource)).map(([resource,value]) => `<span class="cost-row" role="row" data-cost-resource="${esc(resource)}"><span role="rowheader">${resourceLabel(resource)}</span><span role="cell" data-initial><s>${amount(value)}</s></span><span role="cell" data-reduced>${amount(reducedCost(b,resource))}</span></span>`).join('')}</span>`;
  };
  const card = b => `<article class="building-card" data-effects-key="${b.key}" data-building="${esc(b.id)}" data-key="${b.key}" data-city="${b.cityTier ?? 99}" data-tier="${b.tier ?? 99}"><div class="card-top">${image(b)}<div><h3>${esc(b.name)}</h3><div class="meta">${esc([b.origin,b.group].filter(Boolean).join(' · '))}</div></div></div>${tiers(b)}<div class="skill-badges">${badges(b,true)}</div><div class="discounts"><span class="discount-main">−${pct(selectedDiscount(b))} <small>${selectionLabel(b)}</small></span></div><p class="boost-requirement">${b.boostable ? 'Boost: '+esc(b.boostRequirement) : 'This building has no building boost.'}</p><button class="effects-trigger" type="button" data-effects="${b.key}" aria-haspopup="dialog" aria-controls="building-effects-popup" aria-expanded="false"><span aria-hidden="true">ⓘ</span> Building effects</button><button class="inspect" type="button" data-inspect="${b.key}">Requirements & calculation →</button>${buildingCosts(b)}</article>`;
  const nodeHeading = (b,name=b.name,subtitle=b.origin ? `<span class="meta">${esc(b.origin)}</span>` : '') => `<span class="node-heading"><span class="card-top">${image(b)}<span class="node-title"><strong>${esc(name)}</strong>${subtitle}</span></span>${tiers(b)}</span>`;
  const node = (b,visible,key=b.key) => {
    const hidden = b.prerequisites.filter(g => !g.cityLevel && !g.options.some(k => visible.has(k))).length;
    return `<button type="button" class="tree-node" data-effects-key="${b.key}" data-key="${key}" data-building="${esc(b.id)}" data-inspect="${b.key}" aria-label="Inspect ${esc(b.name)}">${nodeHeading(b)}<span class="node-details"><span class="skill-badges">${badges(b,true)}</span><span class="node-discount">−${pct(selectedDiscount(b))} <small>${selectionLabel(b)}</small></span>${b.boostable ? `<span class="boost-requirement">Boost: ${esc(b.boostRequirement)}</span>` : ''}${hidden ? `<span class="hidden-parents">${hidden} prerequisite group${hidden === 1 ? '' : 's'} outside this view</span>` : ''}<span class="effects-trigger" data-effects="${b.key}"><span aria-hidden="true">ⓘ</span> Building effects</span></span>${buildingCosts(b)}</button>`;
  };
  const familyRange = g => {
    const values=g.members.map(selectedDiscount);
    const min=Math.min(...values), max=Math.max(...values);
    return min === max ? '−'+pct(min) : `−${Number(min.toFixed(1))}–${pct(max)}`;
  };
  const variantLinks = members => members.map(b => `<button type="button" class="variant-link" data-inspect="${b.key}"><span>${esc(b.name)}</span><small>${esc(b.culture || 'Shared')}</small></button>`).join('');
  const costRange = values => {
    const min=Math.min(...values), max=Math.max(...values);
    return min === max ? amount(min) : `${amount(min)}–${amount(max)}`;
  };
  const familyCosts = g => {
    if (g.members.some(b => !b.cost)) return '<span class="building-costs">Choose a variant for construction costs</span>';
    const resources=[...new Set(g.members.flatMap(b => Object.keys(b.cost)))];
    return `<span class="building-costs" role="table" aria-label="Construction cost ranges across matching variants"><span class="cost-row cost-heading" role="row"><span role="columnheader">Cost range</span><span role="columnheader">Initial</span><span role="columnheader">Reduced</span></span>${resources.map(resource => `<span class="cost-row" role="row" data-cost-resource="${esc(resource)}"><span role="rowheader">${resourceLabel(resource)}</span><span role="cell" data-initial><s>${costRange(g.members.map(b => b.cost[resource] || 0))}</s></span><span role="cell" data-reduced>${costRange(g.members.map(b => reducedCost(b,resource)))}</span></span>`).join('')}</span>`;
  };
  function familyNode(g,visible,asCard=false) {
    if (g.members.length === 1) return asCard ? card(g.members[0]) : node(g.members[0],visible,g.key);
    const representative=g.members.find(b => !b.culture) || g.members[0];
    const hidden=new Set(g.members.flatMap(b => b.prerequisites.filter(p => !p.cityLevel && !p.options.some(k => visible.has(k))).map(p => p.property))).size;
    const summary=`<span class="card-top">${image(representative)}<strong>${esc(g.name)}</strong></span><span class="family-count">${g.members.length} cultural variants</span>${tiers(representative)}<span class="meta family-hint">Bonuses and boosts vary by variant</span><span class="node-discount">${familyRange(g)} <small>${state.savingsBoosted ? 'total with available boosts' : 'selected bonuses'}</small></span>${hidden ? `<span class="hidden-parents">${hidden} prerequisite group${hidden === 1 ? '' : 's'} outside this view</span>` : ''}`;
    if (asCard) return `<article class="building-card family-card" data-effects-key="${g.key}" data-key="${g.key}">${summary}<details class="variant-list"><summary>Choose a variant</summary>${variantLinks(g.members)}</details><button type="button" class="inspect" data-inspect="${g.key}">Compare variants →</button><button type="button" class="effects-trigger" data-effects="${g.key}" aria-haspopup="dialog" aria-controls="building-effects-popup" aria-expanded="false">ⓘ Building effects</button>${familyCosts(g)}</article>`;
    return `<button type="button" class="tree-node family-node" data-effects-key="${g.key}" data-key="${g.key}" data-inspect="${g.key}" aria-label="Compare ${esc(g.name)}: ${g.members.length} cultural variants">${nodeHeading(representative,g.name,`<span class="family-count">${g.members.length} cultural variants</span>`)}<span class="node-details"><span class="meta family-hint">Bonuses and boosts vary by variant</span><span class="node-discount">${familyRange(g)} <small>${state.savingsBoosted ? 'total with available boosts' : 'selected bonuses'}</small></span>${hidden ? `<span class="hidden-parents">${hidden} prerequisite group${hidden === 1 ? '' : 's'} outside this view</span>` : ''}<span class="family-action">Compare variants →</span><span class="effects-trigger" data-effects="${g.key}">ⓘ Building effects</span></span>${familyCosts(g)}</button>`;
  }
  const treeRenderer=view === 'tree' ? window.AOWBuildingTree.create({families,node:familyNode,esc}) : null;
  function scheduleDraw() { cancelAnimationFrame(drawFrame); drawFrame=requestAnimationFrame(() => treeRenderer?.draw(results)); }
  function renderSavings(list) {
    const totals = skills.map(s => {
      const matching = list.filter(b => b.skills.includes(s.id));
      const known = matching.filter(b => b.cost);
      const saved = resource => known.reduce((sum,b) => sum + (b.cost[resource] || 0) * .25 * (state.savingsBoosted && b.boostable ? .7 : 1),0);
      return {...s,count:matching.length,missing:matching.length-known.length,gold:saved('gold'),production:saved('production')};
    });
    const fill = (row,count,gold,production,missing) => {
      row.querySelector('[data-count]').textContent = count;
      row.querySelector('[data-gold]').textContent = amount(gold)+(missing ? '*' : '');
      row.querySelector('[data-production]').textContent = amount(production)+(missing ? '*' : '');
    };
    for (const s of totals) {
      const row=savings.querySelector(`[data-savings="${s.id}"]`);
      row.classList.toggle('excluded',!state.savingsSkills.has(s.id));
      fill(row,s.count,s.gold,s.production,s.missing);
    }
    const selected = totals.filter(s => state.savingsSkills.has(s.id));
    const affected = list.filter(b => b.skills.some(id => state.savingsSkills.has(id)));
    fill(savings.querySelector('#savings-total'),affected.length,selected.reduce((n,s) => n+s.gold,0),selected.reduce((n,s) => n+s.production,0),selected.some(s => s.missing));
    const cost = resource => list.filter(b => b.cost).reduce((sum,b) => sum+reducedCost(b,resource),0);
    const missing = list.some(b => !b.cost);
    savings.querySelector('#savings-cost').textContent = `Cost to build ${list.length} matching catalogue ${list.length === 1 ? 'entry' : 'entries'}: ${amount(cost('gold'))} gold · ${amount(cost('production'))} production${missing ? '*' : ''}`;
    savings.querySelector('#savings-note').textContent = (state.savingsBoosted
      ? 'Boost requirements assumed met: savings × 0.70 for boostable buildings; others keep their unboosted savings. '
      : 'Unboosted savings. ')
      + 'Rows show each bonus’s individual savings; checked rows add to the total, counting overlapping buildings once per bonus. Building boosts also apply to the cost to build. Other construction resources are unaffected. Nominal values before whole-resource rounding. Counts every matching variant once, including alternatives inside groups; this catalogue total is not a single city’s construction plan.'
      + (missing ? ' * Totals exclude buildings whose costs are unavailable.' : '');
  }
  function render() {
    effects.close();
    resizeObserver?.disconnect();
    const list = buildings.filter(matches).sort(compare);
    const grouped=families.group(list).sort((a,b) => compare(
      {...a.members[0],name:a.members.length > 1 ? a.name : a.members[0].name},
      {...b.members[0],name:b.members.length > 1 ? b.name : b.members[0].name}
    ));
    displayedFamilies=new Map(grouped.map(g => [g.key,g]));
    renderSavings(list);
    app.querySelector('#result-count').textContent = grouped.length === list.length ? `${list.length} building${list.length === 1 ? '' : 's'}` : `${grouped.length} building group${grouped.length === 1 ? '' : 's'} · ${list.length} variants`;
    app.querySelector('#view-explanation').textContent = view === 'tree'
      ? 'Chains run left to right. Cultural replacements share one node; select a group to compare variants. City gates appear on nodes. Filters hide nonmatching variants and arrows; details retain all prerequisites. Scroll the whole diagram sideways or vertically.'
      : (state.sort === 'city' ? 'Sorted by minimum required city level, then building tier. ' : '')+'Cultural replacements are grouped; choose a variant for exact bonuses and requirements. Costs use the bonuses and boost setting selected above.';
    const visible=new Set(list.map(b => b.key));
    results.innerHTML = !list.length ? '<div class="empty"><h2>No matching buildings</h2><p>Try another category or clear a filter.</p></div>' : view === 'tree' ? treeRenderer.html(grouped.flatMap(g => g.members)) : `<div class="building-grid">${grouped.map(g => familyNode(g,visible,true)).join('')}</div>`;
    const suffix=query();
    history.replaceState(null,'',location.pathname+suffix+location.hash);
    app.querySelector('#list-link').href='buildings.html'+suffix;
    app.querySelector('#tree-link').href='building-tree.html'+suffix;
    if (view === 'tree') {
      resizeObserver = new ResizeObserver(scheduleDraw);
      results.querySelectorAll('.tree-node').forEach(c => resizeObserver.observe(c));
      scheduleDraw();
    }
  }
  function inspect(key) {
    effects.close();
    if (key.startsWith('family-')) {
      const g=displayedFamilies.get(key) || [...new Set(families.byMember.values())].find(g => g.key === key);
      if (!g) return;
      app.querySelector('#dialog-content').innerHTML=`<div class="eyebrow">Cultural building variants</div><h2 id="dialog-title">${esc(g.name)}</h2><p class="filter-help">These buildings fill the same prerequisite role. Choose a variant to inspect its exact requirements. Culture and unlocks still apply.</p><div class="variant-comparison">${g.members.map(b => `<section class="variant-option"><div class="card-top">${image(b)}<div><h3><button class="parent-link" type="button" data-inspect="${b.key}">${esc(b.name)}</button></h3><span class="meta">${esc(b.culture || 'Shared')}</span></div></div><div class="skill-badges">${badges(b,true)}</div>${effects.content(b)}<span class="node-discount">−${pct(discount(b))} unboosted${b.boostable ? ` · −${pct(boosted(b))} if boosted` : ''}</span><p class="filter-help">${b.boostable ? 'Boost: '+esc(b.boostRequirement) : 'No building boost'}</p>${buildingCosts(b)}</section>`).join('')}</div>`;
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop=0;
      app.querySelector('#dialog-title').setAttribute('tabindex','-1');
      app.querySelector('#dialog-title').focus({preventScroll:true});
      return;
    }
    const b = byKey.get(key);
    if (!b) return;
    const groups = b.prerequisites.filter(g => !g.cityLevel);
    const parents = groups.map(g => `<li>${families.group(g.options.map(k => byKey.get(k)).filter(Boolean)).map(f => f.members.length > 1
      ? `<details class="prerequisite-family"><summary>${esc(f.name)} <small>· ${f.members.length} cultural alternatives</small></summary>${variantLinks(f.members)}</details>`
      : `<button type="button" class="parent-link" data-inspect="${f.members[0].key}">${esc(f.members[0].name)}${f.members[0].origin ? ' ('+esc(f.members[0].origin)+')' : ''}</button>`
    ).join(' <em>or</em> ')}<small class="property-label">Supplies: ${esc(g.property)}</small></li>`).join('');
    app.querySelector('#dialog-content').innerHTML = `<div class="eyebrow">Building details</div><div class="card-top">${image(b)}<div><h2 id="dialog-title">${esc(b.name)}</h2><span class="meta">${esc([b.origin,b.group].filter(Boolean).join(' · '))}</span></div></div>${tiers(b)}<div class="skill-badges">${badges(b)}</div>${effects.content(b)}<h3>Gold & production discount</h3><div class="formula">${b.skills.length} matching skill${b.skills.length === 1 ? '' : 's'} × 25% = −${pct(discount(b))} unboosted${b.boostable ? `<br>Remaining cost × 0.70 = −${pct(boosted(b))} if boosted` : '<br>No building boost is available.'}</div>${b.boostable ? `<p class="filter-help">Boost condition: ${esc(b.boostRequirement)}</p>` : ''}<p class="filter-help">Assumes every matching skill is unlocked. Percentages apply before whole-resource rounding.</p><h3>Building prerequisites</h3>${parents ? `<p class="filter-help">Meet each group below. Within a group, one alternative is enough, subject to your culture and unlocks.</p><ul>${parents}</ul>` : '<p>No building-property chain was mapped for this entry. Check the additional gates below.</p>'}<h3>Additional gates</h3><ul>${b.cityTier ? `<li>Minimum city level: Town Hall ${roman(b.cityTier)} (including prerequisite buildings).</li>` : '<li>Province improvement; city-level sorting does not apply.</li>'}${b.domainRequirements.map(r => `<li>${b.domainCount ? b.domainCount+' × ' : ''}${esc(r.replace(' - Requisite',''))}.</li>`).join('')}${b.requirementDescription ? `<li>${esc(b.requirementDescription.replace(/\s+/g,' '))}</li>` : ''}${b.origin ? `<li>Origin / unlock context: ${esc(b.origin)}.</li>` : ''}${[...new Set(b.otherRequirements)].filter(r => !/City Tier |Town Hall Tier |Tier [1-4] - Town Hall/.test(r)).map(r => `<li>${esc(r)} <small>(unmapped property condition)</small></li>`).join('')}</ul><p class="filter-help">Building links come from required property IDs. Province, culture, tome, throne-city, and other conditions may also gate construction.</p><h3>Local definition</h3><p class="filter-help">${esc(b.internal)}<br>Resource ${b.key}<br>${esc(b.file)}</p>`;
    const family=families.byMember.get(b.key);
    if (family.members.length > 1) app.querySelector('#dialog-content').insertAdjacentHTML('afterbegin',`<button class="parent-link family-back" type="button" data-inspect="${family.key}">← ${esc(family.name)} variants</button>`);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop=0;
    app.querySelector('#dialog-title').setAttribute('tabindex','-1');
    app.querySelector('#dialog-title').focus({preventScroll:true});
  }
  app.querySelector('#search').addEventListener('input',e => { state.q=e.target.value; render(); });
  for (const name of ['category','culture','sort']) app.querySelector('#'+name).addEventListener('change',e => { state[name]=e.target.value; render(); });
  app.querySelectorAll('.skill-toggle input').forEach(input => input.addEventListener('change',() => {
    if (input.checked) state.skills.add(input.value); else state.skills.delete(input.value);
    render();
  }));
  app.querySelector('.reset').addEventListener('click',() => {
    Object.assign(state,{category:'all',culture:'',skills:new Set(),q:'',sort:'city'});
    app.querySelector('#search').value='';
    for (const name of ['category','culture','sort']) app.querySelector('#'+name).value=state[name];
    app.querySelectorAll('.skill-toggle input').forEach(i => { i.checked=false; });
    render();
  });
  app.addEventListener('click',e => { const button=e.target.closest('[data-inspect]'); if (button) inspect(button.dataset.inspect); });
  app.querySelector('.dialog-close').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close(); } });
  window.addEventListener('resize',scheduleDraw);
  savings.querySelector('#savings-boosted').addEventListener('change',e => { state.savingsBoosted=e.target.checked; render(); });
  savings.querySelectorAll('tbody input').forEach(input => input.addEventListener('change',() => {
    if (input.checked) state.savingsSkills.add(input.value); else state.savingsSkills.delete(input.value);
    render();
  }));
  document.fonts?.ready.then(scheduleDraw);
  render();
})();
