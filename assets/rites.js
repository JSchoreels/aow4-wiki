(function (root) {
  'use strict';
  const costAt = (rite, use) => rite.initialCost + (use - 1) * rite.costIncrease;
  const totalCost = (rite, uses) => uses * rite.initialCost + rite.costIncrease * uses * (uses - 1) / 2;
  const affinityAt = (rite, use) => use === 1 ? rite.unlockAffinity : rite.rechargeAffinity === 0 ? 0 : rite.rechargeAffinity + (use - 1) * rite.rechargeIncrease;
  const turnsAt = (rite, use, income) => Math.ceil(affinityAt(rite, use) / income);
  const bounded = (value, fallback, max) => Number.isFinite(Number(value)) && Number(value) >= 1 ? Math.min(max, Math.floor(Number(value))) : fallback;
  const matches = (rite, affinity, search) => (!affinity || rite.affinity === affinity) && (rite.name + ' ' + rite.affinity + ' ' + rite.effect.replace(/<[^>]*>/g, ' ')).toLowerCase().includes(search.trim().toLowerCase());
  const api = {costAt, totalCost, affinityAt, turnsAt, bounded, matches};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  const data = root.AOW4_RITES;
  const affinities = ['General', 'Nature', 'Chaos', 'Astral', 'Materium', 'Order', 'Shadow'];
  const $ = id => document.getElementById(id);
  const format = number => number.toLocaleString('en-US');
  const params = new URLSearchParams(location.search);
  const state = {affinity: affinities.includes(params.get('affinity')) ? params.get('affinity') : '', search: params.get('q') || '', use: bounded(params.get('use'), 1, 50), income: bounded(params.get('income'), 10, 250), rite: params.get('rite') || 'rite_of_expansive_growth'};
  if (!data.rites.some(r => r.id === state.rite)) state.rite = 'rite_of_expansive_growth';
  const select = $('rite-select');
  for (const affinity of affinities) {
    const group = document.createElement('optgroup'); group.label = affinity;
    for (const rite of data.rites.filter(r => r.affinity === affinity)) {
      const option = document.createElement('option'); option.value = rite.id; option.textContent = rite.name; group.append(option);
    }
    select.append(group);
  }
  select.value = state.rite; $('affinity-filter').value = state.affinity; $('rite-search').value = state.search; $('use-number').value = state.use; $('affinity-income').value = state.income;
  function effectText(markup) {
    // The export uses game-specific tags, never insert its markup into the DOM.
    return markup.replace(/<br><\/br>/g, ' ').replace(/<\/?bullet(?:list)?>/g, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().replace(/(\d)([A-Z])/g, '$1 $2');
  }
  function element(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
  function icon(rite) {
    const image = element('img', 'rite-icon'); image.width = 46; image.height = 46; image.alt = ''; image.loading = 'lazy';
    image.src = 'https://cdn.jsdelivr.net/gh/MinionsArt/aow4db@df99314bf82c1bdeef51206a7257d7bb125b35a8/Icons/EmpireProgressionIcons/' + rite.icon + '.png';
    image.addEventListener('error', () => { image.hidden = true; }); return image;
  }
  function saveURL() {
    const query = new URLSearchParams();
    if (state.affinity) query.set('affinity', state.affinity);
    if (state.search) query.set('q', state.search);
    if (state.use !== 1) query.set('use', state.use);
    if (state.income !== 10) query.set('income', state.income);
    if (state.rite !== 'rite_of_expansive_growth') query.set('rite', state.rite);
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : '') + location.hash);
  }
  function renderCalculator() {
    const rite = data.rites.find(r => r.id === state.rite);
    $('selected-name').textContent = rite.name;
    $('selected-affinity').textContent = rite.affinity + ' · ' + (rite.rechargeAffinity ? 'recharges with affinity' : 'no recharge after unlocking');
    $('selected-effect').textContent = effectText(rite.effect);
    $('selected-price').textContent = format(costAt(rite, state.use));
    $('selected-total').textContent = format(totalCost(rite, state.use));
    $('selected-use').textContent = state.use;
    $('selected-total-label').textContent = 'Total for uses 1–' + state.use;
    const cells = [];
    for (let use = state.use; use < Math.min(51, state.use + 6); use++) {
      const cell = element('div', 'rite-step' + (use === state.use ? ' is-current' : ''));
      cell.append(element('span', 'step-label', 'Use ' + use), element('strong', '', format(costAt(rite, use))), element('span', 'step-unit', 'Imperium'));
      const required = affinityAt(rite, use);
      cell.append(element('small', '', required ? format(required) + ' affinity' : 'No recharge'));
      cells.push(cell);
    }
    $('cost-sequence').replaceChildren(...cells);
    const points = affinityAt(rite, state.use);
    $('selected-timing').textContent = points ? format(points) + ' ' + (rite.affinity === 'General' ? 'total' : rite.affinity) + ' affinity points · about ' + format(turnsAt(rite, state.use, state.income)) + ' turns from zero at ' + state.income + '/turn.' : 'No affinity recharge: buy again immediately if you have the Imperium.';
    $('timing-help').textContent = state.use === 1 ? 'Use 1 shows the initial unlock threshold. For later uses, the estimate starts from zero after the preceding purchase.' : 'The estimate starts from zero after the preceding purchase. Subtract any affinity progress already accumulated in your game.';
  }
  function renderRows() {
    const visible = data.rites.filter(r => matches(r, state.affinity, state.search));
    $('result-count').textContent = visible.length + ' of ' + data.rites.length + ' repeatables';
    $('cost-use-heading').textContent = 'Use ' + state.use;
    $('affinity-use-heading').textContent = 'Affinity for use ' + state.use;
    const rows = [];
    for (const rite of visible) {
      const row = element('tr', rite.id === state.rite ? 'is-selected' : '');
      const heading = element('th'); heading.scope = 'row';
      const button = element('button', 'rite-name'); button.type = 'button'; button.setAttribute('aria-label', 'Inspect ' + rite.name);
      const text = element('span'); text.append(element('strong', '', rite.name), element('small', 'rite-affinity', rite.affinity)); button.append(icon(rite), text);
      button.addEventListener('click', () => { state.rite = rite.id; select.value = rite.id; render(); $('calculator-title').scrollIntoView({block:'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); });
      heading.append(button, element('p', 'rite-effect', effectText(rite.effect))); row.append(heading);
      for (const [label, content, className] of [['First use', format(rite.initialCost), ''], ['Each repeat', '+' + format(rite.costIncrease), 'rite-increase'], ['Use ' + state.use, format(costAt(rite, state.use)), 'rite-current'], ['Total to use ' + state.use, format(totalCost(rite, state.use)), ''], ['Affinity for use ' + state.use, affinityAt(rite, state.use) ? format(affinityAt(rite, state.use)) + ' points' : 'No recharge', '']]) {
        const cell = element('td', className, content); cell.dataset.label = label; row.append(cell);
      }
      rows.push(row);
    }
    $('rites-rows').replaceChildren(...rows); $('rites-empty').hidden = visible.length > 0; $('rites-table-wrap').hidden = !visible.length;
  }
  function render() { renderCalculator(); renderRows(); saveURL(); }
  $('affinity-filter').addEventListener('change', event => { state.affinity = event.target.value; render(); });
  $('rite-search').addEventListener('input', event => { state.search = event.target.value; render(); });
  select.addEventListener('change', event => { state.rite = event.target.value; render(); });
  for (const [id, key, max] of [['use-number','use',50], ['affinity-income','income',250]]) {
    const update = event => { state[key] = bounded(event.target.value, key === 'use' ? 1 : 10, max); render(); };
    $(id).addEventListener('input', update);
    $(id).addEventListener('change', event => { update(event); event.target.value = state[key]; });
  }
  $('reset-rites').addEventListener('click', () => { state.affinity = ''; state.search = ''; $('affinity-filter').value = ''; $('rite-search').value = ''; render(); });
  render();
})(typeof window === 'undefined' ? globalThis : window);
