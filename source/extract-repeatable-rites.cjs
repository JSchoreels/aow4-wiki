/* Read installed RPK definitions. No writes to the game directory. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const game = process.argv[2];
if (!game) throw new Error('Usage: node source/extract-repeatable-rites.cjs <game-directory>');
const labels = require('./rite-labels.json');
const sourceFiles = [];
function read(relative) {
  const data = fs.readFileSync(path.join(game, relative));
  sourceFiles.push({path: relative.replaceAll('\\', '/'), sha256: crypto.createHash('sha256').update(data).digest('hex')});
  return data;
}
function fields(buffer, start, end) {
  assert.equal(buffer[start], 1, 'Expected indexed compound');
  const count = buffer[start + 1] & 127;
  const wide = buffer[start + 1] & 128 ? buffer.readUInt32LE(start + 2) : 0;
  let cursor = start + 2 + (wide ? 4 : 0);
  const offsets = [];
  for (let i = 0; i < count; i++, cursor += 2) offsets.push([buffer[cursor], buffer[cursor + 1]]);
  for (let i = 0; i < wide; i++, cursor += 8) offsets.push([buffer.readUInt32LE(cursor), buffer.readUInt32LE(cursor + 4)]);
  const result = new Map();
  for (const [id, offset] of offsets) {
    const next = offsets.filter(x => x[1] > offset).map(x => x[1]);
    const stop = next.length ? cursor + Math.min(...next) : end;
    result.set(id, {offset: cursor + offset, data: buffer.subarray(cursor + offset, stop)});
  }
  return result;
}
function records(buffer) {
  const marker = Buffer.from('8001000000002040000000000000', 'hex');
  const result = [];
  for (let at = buffer.indexOf(marker); at >= 0; at = buffer.indexOf(marker, at + 1)) {
    let q = at + marker.length;
    const length = buffer.readUInt32LE(q); q += 4;
    if (length > 100 || q + length + 4 > buffer.length) continue;
    const display = buffer.subarray(q, q + length).toString(); q += length;
    if (!/^\[#([0-9a-f]{16})\]/i.test(display)) continue;
    const nameLength = buffer.readUInt32LE(q); q += 4;
    if (nameLength > 300 || q + nameLength + 8 > buffer.length) continue;
    const name = buffer.subarray(q, q + nameLength).toString(); q += nameLength;
    const id = buffer.readBigUInt64LE(q).toString(16).padStart(16, '0').toUpperCase(); q += 8;
    result.push({id, name, start: at, payload: q});
  }
  for (let i = 0; i < result.length; i++) result[i].end = result[i + 1]?.start ?? buffer.length;
  return result;
}
function links(data) { return [...data.toString('latin1').matchAll(/\[#([A-Fa-f0-9]{16})\]/g)].map(x => x[1].toUpperCase()); }
function localization(data) { return data.toString('latin1').match(/EMPIRE_DEVELOPMENT@[A-Z_]+@[A-Z_]+@NAME/)?.[0]; }
function mo(buffer) {
  assert.equal(buffer.readUInt32LE(0), 0x950412de);
  const count = buffer.readUInt32LE(8), original = buffer.readUInt32LE(12), translated = buffer.readUInt32LE(16);
  const values = new Map();
  for (let i = 0; i < count; i++) {
    const a = original + i * 8, b = translated + i * 8;
    values.set(buffer.subarray(buffer.readUInt32LE(a + 4), buffer.readUInt32LE(a + 4) + buffer.readUInt32LE(a)).toString(), buffer.subarray(buffer.readUInt32LE(b + 4), buffer.readUInt32LE(b + 4) + buffer.readUInt32LE(b)).toString());
  }
  return values;
}
const definitionsPath = 'Content/Title/Packs/Definitions/EmpireProgression_Definition.rpk';
const definitionBytes = read(definitionsPath);
const definitions = new Map(records(definitionBytes).map(r => [r.id, r]));
const dictionary = mo(read('Language/EN/EN.MO'));
const imperiumId = Buffer.from('62030000d4030000', 'hex');
const treeBytes = read('Content/Title/Packs/Research/EmpireProgression_Tree.rpk');
// Serialized Skill Tree XP array, including level zero. Keep the shape guard
// so a changed game format fails explicitly instead of silently reading junk.
assert.equal(treeBytes.readUInt32LE(0x204), 12);
const thresholds = Array.from({length: 12}, (_, i) => treeBytes.readInt32LE(0x208 + i * 4));
assert.deepEqual(thresholds, [0, 15, 40, 60, 100, 120, 160, 200, 300, 400, 500, 600]);
const rites = [];
for (const [affinity, file] of [['General', 'Core_Empire_Development'], ...['Nature', 'Chaos', 'Astral', 'Materium', 'Order', 'Shadow'].map(a => [a, 'EmpireProgression_' + a])]) {
  const relative = 'Content/Title/Packs/Research/' + file + '.rpk';
  const buffer = read(relative);
  for (const record of records(buffer)) {
    if (!/Rite|Expanded Governance/.test(record.name) || /Icon/.test(record.name)) continue;
    const root = fields(buffer, record.payload, record.end);
    if (!root.has(0x10)) continue;
    const settingsId = links(root.get(0x10).data)[0];
    const settings = definitions.get(settingsId);
    if (!settings || !/Repeat Settings/.test(settings.name)) continue;
    const costId = links(root.get(0x0d).data)[0];
    const cost = definitions.get(costId);
    assert(cost, 'Missing linked cost definition');
    const costSlice = definitionBytes.subarray(cost.payload, cost.end);
    const costIndex = costSlice.indexOf(imperiumId);
    assert(costIndex >= 0);
    const initialCost = costSlice.readInt32LE(costIndex + 8);
    const settingsSlice = definitionBytes.subarray(settings.payload, settings.end);
    const incrementIndex = settingsSlice.indexOf(imperiumId);
    assert(incrementIndex >= 0);
    const costIncrease = settingsSlice.readInt32LE(incrementIndex + 8);
    const sharedSettings = settings.name.startsWith('Standard');
    const rechargeIncrease = sharedSettings ? settingsSlice.readInt32LE(incrementIndex + 12) : 0;
    const nameKey = localization(root.get(1).data);
    const name = dictionary.get(nameKey);
    assert(name, 'Missing local name: ' + record.name);
    const condition = root.get(6).data;
    // General conditions serialize an extra "all affinities" flag after the level.
    const level = condition.readInt32LE(condition.length - (affinity === 'General' ? 5 : 4));
    assert(level >= 1 && level <= 11, 'Unexpected affinity level for ' + name + ': ' + level + ' / ' + condition.toString('hex'));
    const label = labels.entries.find(l => l.name === name);
    assert(label, 'Missing effect label for ' + name);
    rites.push({id: label.id, name, affinity, level, icon: links(root.get(7).data)[0], effect: label.description,
      initialCost, costIncrease, unlockAffinity: thresholds[level], rechargeAffinity: sharedSettings ? thresholds[level] : 0, rechargeIncrease,
      resourceId: record.id, package: relative, costResourceId: costId, repeatResourceId: settingsId,
      evidence: {costOffset: cost.payload + costIndex + 8, incrementOffset: settings.payload + incrementIndex + 8}});
  }
}
assert.equal(rites.length, 20, 'Unexpected number of repeatables; review extraction');
assert.equal(new Set(rites.map(r => r.id)).size, 20);
rites.sort((a, b) => ['General','Nature','Chaos','Astral','Materium','Order','Shadow'].indexOf(a.affinity) - ['General','Nature','Chaos','Astral','Materium','Order','Shadow'].indexOf(b.affinity) || a.level - b.level);
const manifest = fs.readFileSync(path.resolve(game, '../../appmanifest_1669000.acf'), 'utf8');
const steamBuild = manifest.match(/"buildid"\s+"(\d+)"/)?.[1];
assert(steamBuild, 'Unable to determine installed Steam build');
const checked = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const data = {checked, steamBuild, descriptionSource: {repository: labels.source, blob: labels.blob}, sourceFiles, rites};
fs.writeFileSync(path.join(__dirname, '../assets/rites-data.js'), '/* Numeric values and names verified against installed game resources. */\nwindow.AOW4_RITES = ' + JSON.stringify(data, null, 2) + ';\n');
console.table(rites.map(({name, affinity, initialCost, costIncrease, rechargeAffinity, rechargeIncrease}) => ({name, affinity, initialCost, costIncrease, rechargeAffinity, rechargeIncrease})));
console.log('Extracted ' + rites.length + ' local repeatable definitions.');
