/* Dependency-free columns with measured, right-angle prerequisite arrows. */
window.AOWBuildingTree = {
  orderColumns(input,edges) {
    const copy=columns => columns.map(([rank,gs]) => [rank,gs.slice()]);
    let columns=copy(input);
    const rank=new Map(columns.flatMap(([r,gs]) => gs.map(g => [g.key,r])));
    // Long links use the top rails; only links between neighboring columns can cross here.
    const links=edges.filter(e => rank.get(e.to) === rank.get(e.from)+1);
    const rows=() => new Map(columns.flatMap(([,gs]) => gs.map((g,i) => [g.key,i])));
    function crossings() {
      const row=rows();
      let count=0;
      for (let i=0;i<links.length;i++) for (let j=i+1;j<links.length;j++) {
        const a=links[i], b=links[j];
        if (rank.get(a.from) === rank.get(b.from)
          && (row.get(a.from)-row.get(b.from))*(row.get(a.to)-row.get(b.to)) < 0) count++;
      }
      return count;
    }
    let best=copy(columns), bestCount=crossings();
    if (!bestCount) return best;
    const incoming=new Map(), outgoing=new Map();
    for (const e of links) {
      if (!incoming.has(e.to)) incoming.set(e.to,[]);
      if (!outgoing.has(e.from)) outgoing.set(e.from,[]);
      incoming.get(e.to).push(e.from);
      outgoing.get(e.from).push(e.to);
    }
    // Sweep both ways so earlier columns can also follow the order of their descendants.
    for (let pass=0;pass<4 && bestCount;pass++) for (const forward of [true,false]) {
      const neighbors=forward ? incoming : outgoing;
      for (const [,gs] of forward ? columns : columns.slice().reverse()) {
        const row=rows();
        const center=g => {
          const positions=(neighbors.get(g.key) || []).map(k => row.get(k));
          return positions.length ? positions.reduce((sum,n) => sum+n,0)/positions.length : row.get(g.key);
        };
        gs.sort((a,b) => center(a)-center(b));
      }
      const count=crossings();
      if (count < bestCount) { best=copy(columns); bestCount=count; }
    }
    columns=best;
    // Remove remaining avoidable local inversions without accepting a worse arrangement.
    let improved=true;
    while (improved && bestCount) {
      improved=false;
      for (const [,gs] of columns) for (let i=0;i<gs.length-1;i++) {
        [gs[i],gs[i+1]]=[gs[i+1],gs[i]];
        const count=crossings();
        if (count < bestCount) { bestCount=count; improved=true; }
        else [gs[i],gs[i+1]]=[gs[i+1],gs[i]];
      }
    }
    return columns;
  },
  create({families,node,esc}) {
    function html(list) {
      const visible=new Set(list.map(b => b.key));
      const {nodes,edges}=families.graph(list);
      const groups=new Map(nodes.map(g => [g.key,g]));
      const parents=new Map(nodes.map(g => [g.key,[]]));
      const adjacent=new Map(nodes.map(g => [g.key,new Set()]));
      for (const e of edges) {
        parents.get(e.to).push(e.from);
        adjacent.get(e.to).add(e.from);
        adjacent.get(e.from).add(e.to);
      }
      const visited=new Set(), components=[], isolated=[];
      for (const g of nodes) {
        if (visited.has(g.key)) continue;
        if (!adjacent.get(g.key).size) { isolated.push(g); visited.add(g.key); continue; }
        const members=[], stack=[g.key];
        while (stack.length) {
          const key=stack.pop();
          if (visited.has(key)) continue;
          visited.add(key); members.push(key); stack.push(...adjacent.get(key));
        }
        components.push(members);
      }
      const ranks=new Map();
      function rank(key,active=new Set()) {
        if (ranks.has(key)) return ranks.get(key);
        if (active.has(key)) return 0;
        const next=new Set(active); next.add(key);
        const r=Math.max(0,...parents.get(key).map(p => rank(p,next)+1));
        ranks.set(key,r); return r;
      }
      return '<div class="tree-key"><span><i></i>Prerequisite → unlock</span><span><i class="dashed"></i>Alternative or variant-specific route</span></div>'+components.map((keys,index) => {
        const cols=new Map();
        // Keep catalogue order as a stable tie-breaker when branches have equal crossings.
        for (const g of nodes.filter(g => keys.includes(g.key))) {
          const r=rank(g.key);
          if (!cols.has(r)) cols.set(r,[]);
          cols.get(r).push(g);
        }
        const componentEdges=edges.filter(e => keys.includes(e.to));
        const columns=window.AOWBuildingTree.orderColumns([...cols].sort((a,b) => a[0]-b[0]),componentEdges);
        const roots=nodes.filter(g => keys.includes(g.key) && !parents.get(g.key).length);
        const title=(roots.length ? roots : [groups.get(keys[0])]).slice(0,3).map(g => g.name).join(' / ')+(roots.length > 3 ? ' / …' : '');
        const links=componentEdges.map(e => ({...e,routeAbove:rank(e.to) !== rank(e.from)+1}));
        const topSpace=12+links.filter(e => e.routeAbove).length*8;
        return `<section class="tree-component" aria-label="${esc(title)} building chain"><h2 class="component-title">${esc(title)}</h2><div class="tree-scroll" tabindex="0" aria-label="Scroll building chain horizontally"><div class="tree-canvas" style="padding-top:${topSpace}px" data-edges="${esc(JSON.stringify(links))}"><svg class="tree-lines" aria-hidden="true"><defs><marker id="arrow-${index}" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z"></path></marker></defs></svg>${columns.map(([r,gs]) => `<div class="tree-column" data-rank="${r}">${gs.map(g => node(g,visible)).join('')}</div>`).join('')}</div></div></section>`;
      }).join('')+(isolated.length ? `<section class="tree-component"><h2 class="component-title">${components.length ? 'Other buildings' : 'Buildings'} · no building connection within these filters</h2><div class="standalone-nodes">${isolated.map(g => node(g,visible)).join('')}</div></section>` : '');
    }
    function draw(results) {
      for (const canvas of results.querySelectorAll('.tree-canvas')) {
        const nodes=new Map([...canvas.querySelectorAll('.tree-node')].map(n => [n.dataset.key,n]));
        const edges=JSON.parse(canvas.dataset.edges);
        const svg=canvas.querySelector('svg');
        svg.querySelectorAll(':scope > path').forEach(p => p.remove());
        const origin=canvas.getBoundingClientRect();
        const marker=svg.querySelector('marker').id;
        let rail=4;
        for (const edge of edges) {
          const a=nodes.get(edge.from).getBoundingClientRect(), b=nodes.get(edge.to).getBoundingClientRect();
          const x1=a.right-origin.left, y1=a.top+a.height/2-origin.top;
          const x2=b.left-origin.left, y2=b.top+b.height/2-origin.top, mid=(x1+x2)/2;
          const p=document.createElementNS('http://www.w3.org/2000/svg','path');
          // Long dependencies travel above the columns rather than through intervening cards.
          p.setAttribute('d',edge.routeAbove
            ? `M${x1},${y1} H${x1+12} V${rail} H${x2-12} V${y2} H${x2}`
            : `M${x1},${y1} H${mid} V${y2} H${x2}`);
          if (edge.routeAbove) rail+=8;
          p.setAttribute('marker-end',`url(#${marker})`);
          if (edge.alternative) p.classList.add('alternative');
          svg.appendChild(p);
        }
      }
    }
    return {html,draw};
  }
};
