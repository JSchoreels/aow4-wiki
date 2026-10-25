/* Usage: node source/import-building-effects.cjs /path/to/pinned/structure-catalogue.json */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const catalogue=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const byID=new Map(catalogue.map(b=>[BigInt(b.resid).toString(16).toUpperCase().padStart(16,'0'),b]));
const target=path.join(__dirname,'../assets/buildings-data.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(target,'utf8'),context);
const buildings=context.window.AOW_BUILDINGS;
for(const b of buildings){
  const entry=byID.get(b.key);
  assert(entry,`No catalogue entry for ${b.name} (${b.key})`);
  b.gameEffects={income:entry.prediction_description || '',description:entry.description || ''};
  assert(Object.values(b.gameEffects).every(value=>typeof value==='string'));
}
fs.writeFileSync(target,'/* Generated from installed game packages; costs and effect descriptions from the pinned AoW4 Database export. See source/requirements-analysis.txt. */\nwindow.AOW_BUILDINGS = '+JSON.stringify(buildings)+';\n');
console.log(`Imported game effect descriptions for ${buildings.length} buildings; ${buildings.filter(b=>!b.gameEffects.income&&!b.gameEffects.description).length} have no description in the source.`);
