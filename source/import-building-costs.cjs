/* Join the pinned AoW4 Database structure-catalogue.json export by exact game resource ID.
   Usage: node source/import-building-costs.cjs /path/to/structure-catalogue.json */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const catalogue = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const byID = new Map(catalogue.map(b => [BigInt(b.resid).toString(16).toUpperCase().padStart(16,'0'),b]));
const target = path.join(__dirname,'../assets/buildings-data.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(target,'utf8'),context);
const buildings = context.window.AOW_BUILDINGS;
for (const b of buildings) {
  const entry = byID.get(b.key);
  assert(entry,`No catalogue entry for ${b.name} (${b.key})`);
  assert(/^\s*(?:[0-9.]+\s*<([a-z]+)><\/\1>\s*)+$/i.test(entry.cost),`Unknown cost format for ${b.name}`);
  b.cost = {gold:0,production:0};
  for (const match of entry.cost.matchAll(/([0-9.]+)\s*<([a-z]+)>/gi)) {
    const resource = match[2] === 'structureprod' ? 'production' : match[2];
    b.cost[resource] = (b.cost[resource] || 0) + Number(match[1]);
    assert(Number.isFinite(b.cost[resource]) && b.cost[resource] >= 0);
  }
}
fs.writeFileSync(target,'/* Generated from the installed game resource packages; costs from the pinned AoW4 Database export. See source/requirements-analysis.txt. */\nwindow.AOW_BUILDINGS = '+JSON.stringify(buildings)+';\n');
console.log(`Imported construction costs for all ${buildings.length} displayed buildings.`);
