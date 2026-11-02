const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/rites-data.js'), 'utf8'), context);
const data = context.window.AOW4_RITES;
const {costAt, totalCost, affinityAt, turnsAt, bounded, matches} = require('../assets/rites.js');
assert.equal(data.rites.length, 20);
assert.equal(new Set(data.rites.map(r => r.id)).size, 20);
const governance = data.rites.find(r => r.id === 'expanded_governance');
const growth = data.rites.find(r => r.id === 'rite_of_expansive_growth');
const lastStand = data.rites.find(r => r.id === 'rite_of_the_last_stand');
assert.deepEqual([1,2,3,4,5,6].map(n => costAt(governance,n)), [200,500,800,1100,1400,1700]);
assert.deepEqual([1,2,3,4,5,6].map(n => costAt(growth,n)), [250,300,350,400,450,500]);
assert.equal(totalCost(governance, 6), 5700);
assert.equal(totalCost(growth, 6), 2250);
assert.deepEqual([1,2,3].map(n => affinityAt(governance,n)), [100,0,0]);
assert.deepEqual([1,2,3].map(n => affinityAt(growth,n)), [160,210,260]);
assert.deepEqual([1,2,3].map(n => affinityAt(lastStand,n)), [120,170,220]);
assert.equal(turnsAt(growth, 2, 13), 17);
assert.equal(turnsAt(governance, 2, 13), 0);
for (const rite of data.rites) {
  assert.match(rite.icon, /^[0-9A-F]{16}$/);
  assert.match(rite.resourceId, /^[0-9A-F]{16}$/);
  assert(rite.initialCost > 0);
  assert.equal(rite.costIncrease, rite === governance ? 300 : 50);
  assert.equal(rite.rechargeIncrease, rite === governance ? 0 : 50);
  for (const uses of [1,2,6,50]) {
    const sum = Array.from({length: uses}, (_, i) => costAt(rite,i+1)).reduce((a,b) => a+b, 0);
    assert.equal(totalCost(rite,uses), sum, rite.name);
  }
}
assert.equal(bounded(null, 10, 250), 10);
assert.equal(bounded('invalid', 1, 50), 1);
assert.equal(bounded('50000', 1, 50), 50);
assert.equal(bounded('3.7', 1, 50), 3);
assert.equal(data.rites.filter(r => matches(r, 'Nature', '')).length, 3);
assert.equal(data.rites.filter(r => matches(r, '', 'city cap')).length, 2);
assert.equal(data.rites.filter(r => matches(r, 'Chaos', 'wealth')).length, 0);
for (const name of ['index.html', 'buildings.html', 'building-tree.html', 'mechanics.html', 'repeatables.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(html.includes('href="repeatables.html"'), 'Navigation missing from ' + name);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (/^(?:https?:|data:)/.test(url)) continue;
    const target = path.join(root, url.split(/[?#]/)[0]);
    assert(fs.existsSync(target), 'Broken local link in ' + name + ': ' + url);
  }
}
console.log('20 rite definitions, cost totals, recharge rules, filters, input bounds, and navigation passed.');
