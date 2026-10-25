/* Run with node source/check-building-families.cjs; no package installation required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'..');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/buildings-data.js'),'utf8'),context);
const buildings = context.window.AOW_BUILDINGS;
const {createFamilies} = require('../assets/building-families.js');
const families = createFamilies(buildings);
const building = name => buildings.find(b => b.name === name && !b.culture);
const family = name => families.byMember.get(building(name).key);

assert.equal(family('Workshop').members.length,6);
assert.equal(family('Blacksmith').members.length,4);
assert.equal(family('Stonemason').members.length,3);
assert.equal(family('Workshop'),families.byMember.get(buildings.find(b => b.name === "Evocator's Abode").key));
assert.notDeepEqual(building('Workshop').skills,family('Workshop').members.find(b => b.name === "Evocator's Abode").skills);
assert.equal(families.group(buildings).flatMap(g => g.members).length,buildings.length);
assert.equal(new Set(families.group(buildings).flatMap(g => g.members.map(b => b.key))).size,buildings.length);
assert.notEqual(families.byMember.get(buildings.find(b => b.name === 'Wizard Tower: Chambers').key),families.byMember.get(buildings.find(b => b.name === 'Vampire Castle: Chambers').key));

const graph = families.graph(buildings);
const workshopLinks = graph.edges.filter(e => e.from === family('Workshop').key);
assert.equal(workshopLinks.length,3);
assert(workshopLinks.every(e => !e.alternative));
assert.equal(new Set(graph.edges.map(e => e.from+'>'+e.to)).size,graph.edges.length);
assert(graph.edges.every(e => e.from !== e.to && graph.nodes.some(g => g.key === e.from) && graph.nodes.some(g => g.key === e.to)));

for (const culture of new Set(buildings.map(b => b.culture))) {
  const list = buildings.filter(b => !b.culture || b.culture === culture);
  const filtered = families.graph(list);
  assert(filtered.nodes.every(g => g.members.every(b => !b.culture || b.culture === culture)));
  assert.equal(filtered.nodes.flatMap(g => g.members).length,list.length);
}
const evocator = buildings.find(b => b.name === "Evocator's Abode");
const search = families.group([evocator]);
assert.equal(search.length,1);
assert.equal(search[0].members[0],evocator);
assert.equal(search[0].key,family('Workshop').key);

// Same bonuses do not establish equivalence; different stages must stay separate.
const fixture = (key,culture,tier=1) => ({key,name:key,culture,tier,cityTier:1,province:false,group:culture ? 'Culture buildings' : 'Common buildings',prerequisites:[]});
const shared = fixture('shared',''), high = fixture('high','High'), later = fixture('later','Mystic',2), unrelated = fixture('unrelated','Feudal');
const dependent = {...fixture('dependent',''),prerequisites:[{property:'role',cityLevel:false,options:['shared','high','later']}]};
const synthetic = createFamilies([shared,high,later,unrelated,dependent]);
assert.equal(synthetic.byMember.get('shared'),synthetic.byMember.get('high'));
assert.notEqual(synthetic.byMember.get('shared'),synthetic.byMember.get('later'));
assert.notEqual(synthetic.byMember.get('shared'),synthetic.byMember.get('unrelated'));
const conditional = {...fixture('conditional',''),prerequisites:[{property:'specific',cityLevel:false,options:['high']}]};
const conditionalFamilies = createFamilies([shared,high,later,dependent,conditional]);
assert(conditionalFamilies.graph([shared,high,conditional]).edges[0].alternative);
assert.deepEqual(families.graph([]),{nodes:[],edges:[]});

{
  // Arrows use measured card positions and route long dependencies above the columns.
  const paths=[];
  const fallbackContext={window:{},console,document:{createElementNS:() => ({setAttribute(name,value){this[name]=value;},classList:{add(){}}})}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/building-tree.js'),'utf8'),fallbackContext);
  const orderColumns=fallbackContext.window.AOWBuildingTree.orderColumns;
  const keys=names => names.map(key => ({key}));
  const branches=[[0,keys(['Stonemason','Woodworker'])],[1,keys(['Forester','Masonic'])]];
  const reordered=orderColumns(branches,[{from:'Stonemason',to:'Masonic'},{from:'Woodworker',to:'Forester'}]);
  const row=(columns,key) => columns.find(([,gs]) => gs.some(g => g.key === key))[1].findIndex(g => g.key === key);
  assert((row(reordered,'Stonemason')-row(reordered,'Woodworker'))*(row(reordered,'Masonic')-row(reordered,'Forester')) > 0);
  assert.equal(branches[1][1][0].key,'Forester','Ordering must not mutate its input');
  const stable=[[0,keys(['A','B','C'])],[1,keys(['X','Y'])]];
  const connections=[{from:'A',to:'Y'},{from:'B',to:'X'},{from:'C',to:'Y'}];
  const reduced=orderColumns(stable,connections);
  assert(connections.every(a => connections.every(b => (row(reduced,a.from)-row(reduced,b.from))*(row(reduced,a.to)-row(reduced,b.to)) >= 0)),'Descendant ordering must also remove crossings between roots');
  assert.equal(JSON.stringify(orderColumns(stable,connections)),JSON.stringify(reduced),'Ordering must be deterministic');

  // Check the reported Stonemason / Woodworker inversion in the actual rendered catalogue.
  const orderedRenderer=fallbackContext.window.AOWBuildingTree.create({families,node:g => `<b data-test-key="${g.key}"></b>`,esc:String});
  for (const list of [buildings,buildings.filter(b => b.group === 'Common buildings'),buildings.slice().reverse()]) {
    const markup=orderedRenderer.html(list);
    const columns=[...markup.matchAll(/class="tree-column" data-rank="\d+">(.*?)<\/div>/g)].map(m => [...m[1].matchAll(/data-test-key="([^"]+)"/g)].map(m => m[1]));
    const parent=columns.find(c => c.includes(family('Stonemason').key));
    const child=columns.find(c => c.includes(building('Masonic Hall').key));
    assert((parent.indexOf(family('Stonemason').key)-parent.indexOf(family('Woodworker').key))*(child.indexOf(building('Masonic Hall').key)-child.indexOf(building("Forester's Guild").key)) > 0);
  }
  const makeNode=(x) => ({offsetWidth:100,offsetHeight:80,getBoundingClientRect:() => ({left:x,right:x+100,top:0,height:80})});
  const fakeNodes=[{...makeNode(0),dataset:{key:'a'}},{...makeNode(200),dataset:{key:'b'}}];
  const svg={querySelectorAll:() => [],querySelector:() => ({id:'arrow-0'}),appendChild:p => paths.push(p)};
  const canvas={isConnected:true,dataset:{edges:JSON.stringify([{from:'a',to:'b',alternative:false}])},querySelectorAll:selector => {assert.equal(selector,'[data-graph-node]'); return fakeNodes;},querySelector:() => svg,getBoundingClientRect:() => ({left:0,top:0})};
  const renderer=fallbackContext.window.AOWBuildingTree.create({families,node:() => '',esc:String});
  renderer.draw({querySelectorAll:() => [canvas]});
  assert.equal(paths[0].d,'M100,40 H150 V40 H200');
  assert.equal(paths[0]['marker-end'],'url(#arrow-0)');

  paths.length=0;
  for (const n of fakeNodes) n.dataset.variants='2';
  renderer.draw({querySelectorAll:() => [canvas]});
  assert.equal(paths[0].d,'M108,40 H150 V40 H192','Connections should meet the visible family brackets');
  for (const n of fakeNodes) delete n.dataset.variants;

  paths.length=0;
  canvas.dataset.edges=JSON.stringify([{from:'a',to:'b',routeAbove:true,alternative:true}]);
  renderer.draw({querySelectorAll:() => [canvas]});
  assert.equal(paths[0].d,'M100,40 H112 V4 H188 V40 H200');
  const markup=renderer.html(buildings);
  assert(markup.includes('"routeAbove":true'));
  console.log(`Passed family, filter, alternative-route and column-routing checks: ${buildings.length} entries → ${graph.nodes.length} groups, ${graph.edges.length} unique links.`);
}
