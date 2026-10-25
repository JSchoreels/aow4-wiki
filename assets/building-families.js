/* Cultural replacements share a supplied prerequisite property, not necessarily bonuses. */
(() => {
  'use strict';
  function createFamilies(buildings) {
    const byKey = new Map(buildings.map(b => [b.key,b]));
    const parent = new Map(buildings.map(b => [b.key,b.key]));
    function root(key) {
      if (parent.get(key) !== key) parent.set(key,root(parent.get(key)));
      return parent.get(key);
    }
    for (const b of buildings) for (const group of b.prerequisites) {
      const options = group.options.map(k => byKey.get(k)).filter(Boolean);
      // Keep unrelated alternatives (e.g. Wizard Tower / Vampire Castle) separate.
      if (options.length < 2 || !options.some(p => p.culture)) continue;
      if (!options.every(p => p.culture || ['Common buildings','Fortifications & stability'].includes(p.group))) continue;
      // A property can also be supplied at different stages; those are not replacements.
      const compatible = new Map();
      for (const p of options) {
        const stage = JSON.stringify([p.province,p.tier,p.cityTier]);
        if (!compatible.has(stage)) compatible.set(stage,[]);
        compatible.get(stage).push(p);
      }
      for (const members of compatible.values()) {
        if (members.length < 2 || new Set(members.map(p => p.culture)).size !== members.length) continue;
        for (const p of members) parent.set(root(p.key),root(members[0].key));
      }
    }
    const families = new Map();
    for (const b of buildings) {
      const key = root(b.key);
      if (!families.has(key)) families.set(key,[]);
      families.get(key).push(b);
    }
    const byMember = new Map();
    for (const members of families.values()) {
      const representative = members.find(b => !b.culture) || members.slice().sort((a,b) => a.name.localeCompare(b.name))[0];
      const townHall = members.length > 1 && members.every(b => /^Town Hall /.test(b.name));
      const family = {
        key: members.length > 1 ? 'family-'+representative.key : representative.key,
        name: townHall ? representative.name.split(':')[0] : representative.name,
        representative,
        members
      };
      for (const b of members) byMember.set(b.key,family);
    }
    function group(list) {
      const grouped = new Map();
      for (const b of list) {
        const family = byMember.get(b.key);
        if (!grouped.has(family.key)) grouped.set(family.key,{...family,members:[]});
        grouped.get(family.key).members.push(b);
      }
      return [...grouped.values()];
    }
    return {
      byMember,
      group,
      graph(list) {
        const nodes = group(list);
        const visible = new Map(list.map(b => [b.key,b]));
        const grouped = new Map(nodes.map(g => [g.key,g]));
        const links = new Map();
        for (const b of list) for (const requirement of b.prerequisites) {
          if (requirement.cityLevel && !/^Town Hall /.test(b.name)) continue;
          const target = byMember.get(b.key).key;
          const suppliers = requirement.options.filter(k => visible.has(k)
            && (!requirement.cityLevel || !b.culture || visible.get(k).culture === b.culture));
          for (const key of suppliers) {
            const source = byMember.get(key).key;
            if (source === target) continue;
            const id = source+'>'+target;
            if (!links.has(id)) links.set(id,{from:source,to:target,sources:new Set(),targets:new Set(),alternative:false,properties:new Set()});
            const link = links.get(id);
            link.sources.add(key);
            link.targets.add(b.key);
            link.properties.add(requirement.property);
            // Alternatives within one cultural family no longer create parallel arrows.
            if (new Set(requirement.options.map(k => byMember.get(k)?.key).filter(Boolean)).size > 1) link.alternative = true;
          }
        }
        const edges = [...links.values()].map(e => ({
          from:e.from,to:e.to,
          alternative:e.alternative || e.sources.size < grouped.get(e.from).members.length || e.targets.size < grouped.get(e.to).members.length,
          properties:[...e.properties]
        }));
        return {nodes,edges};
      }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {createFamilies};
  else window.AOWBuildingFamilies = {createFamilies};
})();
