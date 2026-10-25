/* DOM nodes remain keyboard-accessible; ELK only computes positions and arrow routes. */
window.AOWBuildingTree = {
  create({families,node,esc}) {
    const elk=window.ELK ? new window.ELK() : null;
    const cache=new Map();
    let generation=0;
    function html(list) {
      generation++;
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
        // Preserve the selected catalogue order in keyboard navigation and the fallback.
        for (const g of nodes.filter(g => keys.includes(g.key))) {
          const r=rank(g.key);
          if (!cols.has(r)) cols.set(r,[]);
          cols.get(r).push(g);
        }
        const roots=nodes.filter(g => keys.includes(g.key) && !parents.get(g.key).length);
        const title=(roots.length ? roots : [groups.get(keys[0])]).slice(0,3).map(g => g.name).join(' / ')+(roots.length > 3 ? ' / …' : '');
        const links=edges.filter(e => keys.includes(e.to));
        return `<section class="tree-component" aria-label="${esc(title)} building chain"><h2 class="component-title">${esc(title)}</h2><div class="tree-scroll" tabindex="0" aria-label="Scroll building chain horizontally"><div class="tree-canvas" data-edges="${esc(JSON.stringify(links))}"><svg class="tree-lines" aria-hidden="true"><defs><marker id="arrow-${index}" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z"></path></marker></defs></svg>${[...cols].sort((a,b) => a[0]-b[0]).map(([r,gs]) => `<div class="tree-column" data-rank="${r}">${gs.map(g => node(g,visible)).join('')}</div>`).join('')}</div></div></section>`;
      }).join('')+(isolated.length ? `<section class="tree-component"><h2 class="component-title">${components.length ? 'Other buildings' : 'Buildings'} · no building connection within these filters</h2><div class="standalone-nodes">${isolated.map(g => node(g,visible)).join('')}</div></section>` : '');
    }
    async function draw(results) {
      const version=generation;
      for (const canvas of results.querySelectorAll('.tree-canvas')) {
        if (!canvas.isConnected || version !== generation) return;
        const nodes=new Map([...canvas.querySelectorAll('.tree-node')].map(n => [n.dataset.key,n]));
        const edges=JSON.parse(canvas.dataset.edges);
        const graph={id:'root',layoutOptions:{
          'elk.algorithm':'layered','elk.direction':'RIGHT','elk.edgeRouting':'ORTHOGONAL',
          'elk.spacing.nodeNode':'24','elk.layered.spacing.nodeNodeBetweenLayers':'64',
          'elk.padding':'[top=12,left=12,bottom=12,right=12]'
        },children:[...nodes].map(([id,n]) => ({id,width:n.offsetWidth,height:n.offsetHeight})),
        edges:edges.map((e,i) => ({id:'e'+i,sources:[e.from],targets:[e.to]}))};
        const signature=JSON.stringify(graph);
        if (canvas.dataset.layoutSignature === signature) continue;
        let layout;
        if (elk) {
          try {
            if (!cache.has(signature)) {
              if (cache.size >= 32) cache.delete(cache.keys().next().value);
              const pending=elk.layout(graph).catch(error => { cache.delete(signature); throw error; });
              cache.set(signature,pending);
            }
            layout=await cache.get(signature);
          } catch (error) { console.warn('ELK layout unavailable; using column layout.',error); }
        }
        if (!canvas.isConnected || version !== generation) return;
        if (layout) {
          canvas.classList.add('elk-layout');
          canvas.style.width=layout.width+'px';
          canvas.style.height=layout.height+'px';
          for (const n of layout.children) {
            nodes.get(n.id).style.left=n.x+'px';
            nodes.get(n.id).style.top=n.y+'px';
          }
        }
        const svg=canvas.querySelector('svg');
        svg.querySelectorAll(':scope > path').forEach(p => p.remove());
        const origin=canvas.getBoundingClientRect();
        const marker=svg.querySelector('marker').id;
        for (const [i,edge] of edges.entries()) {
          const a=nodes.get(edge.from).getBoundingClientRect(), b=nodes.get(edge.to).getBoundingClientRect();
          const x1=a.right-origin.left, y1=a.top+a.height/2-origin.top;
          const x2=b.left-origin.left, y2=b.top+b.height/2-origin.top, mid=(x1+x2)/2;
          const sections=layout?.edges.find(e => e.id === 'e'+i)?.sections;
          const p=document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d',sections?.length ? sections.map(s => [s.startPoint,...(s.bendPoints || []),s.endPoint].map((p,i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')).join(' ') : `M${x1},${y1} H${mid} V${y2} H${x2}`);
          p.setAttribute('marker-end',`url(#${marker})`);
          if (edge.alternative) p.classList.add('alternative');
          svg.appendChild(p);
        }
        canvas.dataset.layoutSignature=signature;
        canvas.dataset.layout=layout ? 'elk' : 'columns';
      }
    }
    return {html,draw};
  }
};
