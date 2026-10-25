/* Game effect markup is rendered from an allowlist; source HTML and attributes are never copied. */
(() => {
  'use strict';
  const esc=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const files={gold:'gold',mana:'mana',food:'food',knowledge:'knowledge',structureprod:'production',production:'production',unitprod:'draft',happiness:'happiness',population:'population',garrison:'fortification',farm:'farm',farms:'farm',forester:'forester',quarry:'quarry',mine:'mine',conduit:'conduit',researchpost:'researchpost',turn:'turn',xp:'xp',souls:'souls',thralls:'thrall',bindingessence:'bindingEssence',teleporter:'teleporter',range:'range',astralechoes:'astral_echoes',chaos:'chaos',matter:'materium',nature:'nature',order:'order',shadow:'shadow',caststrategic:'strategiccombatpoints',optactical:'tacticalcombatpoints',casttactical:'tacticalcombatpoints',defensefrost:'frost_resistance',defenseblight:'blight_resistance',defensephysical:'physical_resistance',defenselightning:'lightning_resistance',defensefire:'fire_resistance',defensespirit:'spirit_resistance',damagephysical:'physical',damagefire:'fire',damageblight:'blight',damagespirit:'spirit',temphp:'tempHitpoints',sitegold:'goldWonder'};
  Object.assign(files,{hp:'health',arcana:'astral',influence:'imperium',minorcity:'free_city'});
  const labels={structureprod:'Production',unitprod:'Draft',garrison:'Fortification health',hp:'Hit Points',temphp:'Temporary Hit Points',arcana:'Astral',influence:'Imperium',medalgold:'Rank',minorcity:'Free City',rs_vassalage3:'Vassalage',monument:'Monument',bindingessence:'Binding Essence',optactical:'Combat casting points',casttactical:'Combat casting points',caststrategic:'World casting points'};
  window.AOWBuildingEffects={create({root,buildings,iconBase,onInspect}){
    const byKey=new Map(buildings.map(b=>[b.key,b]));
    const textBase=iconBase.replace('UpgradeIcons/','Text/');
    const icon=(tag,accessible=false)=>files[tag] ? `<img class="game-resource-icon" src="${textBase+files[tag]}.png" alt="${accessible ? esc(labels[tag] || tag) : ''}" width="25" height="25" loading="lazy" decoding="async">` : `<span class="game-symbol">${esc(labels[tag] || tag.replace(/_/g,' '))}</span>`;
    function rich(source){
      const template=document.createElement('template');
      template.innerHTML=source || '';
      const walk=node=>{
        if(node.nodeType===Node.TEXT_NODE)return esc(node.textContent);
        if(node.nodeType!==Node.ELEMENT_NODE)return '';
        const tag=node.localName.toLowerCase();
        if(['script','style','iframe','object','template'].includes(tag))return '';
        const children=()=>[...node.childNodes].map(walk).join('');
        if(tag==='bulletlist')return `<ul>${children()}</ul>`;
        if(tag==='bullet')return `<li>${children()}</li>`;
        if(tag==='hyperlink')return `<span class="game-term">${children()}</span>`;
        if(tag==='br')return '<br>';
        if(tag==='p')return `<p>${children()}</p>`;
        if(['b','strong'].includes(tag))return `<strong>${children()}</strong>`;
        if(['i','em'].includes(tag))return `<em>${children()}</em>`;
        if(files[tag] || labels[tag])return icon(tag,true)+children();
        return children();
      };
      return [...template.content.childNodes].map(walk).join('');
    }
    function income(source){
      const bullets=[...source.matchAll(/<bullet>([\s\S]*?)<\/bullet>/gi)].map(m=>m[1]);
      const parts=bullets.length ? bullets : [source];
      const outside=bullets.length ? source.replace(/<bullet>[\s\S]*?<\/bullet>/gi,'').replace(/<\/?bulletlist>/gi,'').trim() : '';
      return (outside ? `<div class="effect-copy">${rich(outside)}</div>` : '')+parts.map(part=>{
        const match=part.match(/^\s*([+-]\d+(?:\.\d+)?)\s*<(\w+)>\s*<\/\2>\s*<hyperlink>([^<>]+)<\/hyperlink>\s*income([\s\S]*)$/i);
        if(!match)return `<div class="effect-copy">${rich(part)}</div>`;
        const condition=match[4].trim().replace(/:\s*$/,'');
        return `<div class="income-row">${icon(match[2].toLowerCase())}<span class="income-label">${esc(match[3])}<small> / turn</small></span><span class="income-value">${esc(match[1])}</span></div>${condition ? `<div class="income-condition">${rich(condition)}</div>` : ''}`;
      }).join('');
    }
    function content(b){
      const effects=b.gameEffects || {};
      return `<div class="game-effects">${effects.income ? `<section><h3 class="effect-section-label">City income</h3>${income(effects.income)}</section>` : ''}${effects.description ? `<section class="special-effects"><h3 class="effect-section-label">Effects</h3><div class="effect-copy">${rich(effects.description)}</div></section>` : ''}${!effects.income&&!effects.description ? '<p class="effect-copy">Effect description unavailable in the source data.</p>' : ''}</div>`;
    }
    const popup=document.createElement('section');
    popup.id='building-effects-popup';
    popup.className='game-effects-tooltip';
    popup.hidden=true;
    popup.setAttribute('role','dialog');
    popup.setAttribute('aria-modal','false');
    popup.setAttribute('aria-labelledby','effects-popup-title');
    document.body.append(popup);
    let anchor=null,pinned=false,suppressFocus=false,openTimer,closeTimer;
    function close(){
      clearTimeout(openTimer);clearTimeout(closeTimer);
      anchor?.removeAttribute('aria-describedby');
      root.querySelectorAll('[data-effects][aria-expanded="true"]').forEach(n=>n.setAttribute('aria-expanded','false'));
      popup.hidden=true;anchor=null;pinned=false;
    }
    function dismiss(){const previous=anchor?.matches('button') ? anchor : anchor?.querySelector('[data-effects]');close();suppressFocus=true;previous?.focus({preventScroll:true});suppressFocus=false;}
    function position(){
      if(!anchor?.isConnected){close();return;}
      if(matchMedia('(max-width:650px)').matches){popup.style.left='';popup.style.top='';popup.dataset.side='bottom';return;}
      const rect=anchor.getBoundingClientRect(),width=popup.offsetWidth,height=popup.offsetHeight;
      const right=rect.right+14;
      const left=right+width<=innerWidth-8 ? right : rect.left-width-14;
      popup.dataset.side=left>=rect.right ? 'right' : 'left';
      popup.style.left=Math.max(8,Math.min(left,innerWidth-width-8))+'px';
      popup.style.top=Math.max(8,Math.min(rect.top+24,innerHeight-height-8))+'px';
    }
    function show(target,key,keep=false){
      const b=byKey.get(key);
      if(!b)return;
      clearTimeout(openTimer);clearTimeout(closeTimer);
      anchor?.removeAttribute('aria-describedby');
      anchor=target;pinned=keep;
      popup.innerHTML=`<button type="button" class="effects-close" aria-label="Close building effects">×</button><div class="effects-tooltip-heading"><img class="building-icon" src="${iconBase+esc(b.icon)}.png" alt="" width="44" height="44"><div><h2 id="effects-popup-title">${esc(b.name)}</h2><div class="meta">${b.province ? 'Province improvement' : 'City structure'}${b.tier ? ' · Tier '+['','I','II','III','IV'][b.tier] : ''}</div></div></div><div class="effects-tooltip-body">${content(b)}${b.boostable ? `<section class="effects-boost"><h3 class="effect-section-label">Boost condition</h3><div>${esc(b.boostRequirement)}</div></section>` : ''}</div><button type="button" class="effects-details" data-effects-inspect="${esc(b.key)}">Requirements & calculation →</button>`;
      popup.hidden=false;
      anchor.setAttribute('aria-describedby',popup.id);
      root.querySelectorAll(`[data-effects="${b.key}"]`).forEach(n=>n.setAttribute('aria-expanded','true'));
      position();
      if(keep)popup.querySelector('.effects-close').focus({preventScroll:true});
    }
    function delayedClose(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!pinned&&!popup.matches(':hover')&&!anchor?.matches(':hover')&&!popup.contains(document.activeElement)&&!anchor?.contains(document.activeElement))close();},180);}
    root.addEventListener('pointerover',event=>{
      if(event.pointerType==='touch'||root.querySelector('dialog[open]')||pinned)return;
      const target=event.target.closest('[data-effects-key]');
      if(!target || target.contains(event.relatedTarget))return;
      clearTimeout(openTimer);clearTimeout(closeTimer);
      openTimer=setTimeout(()=>show(target,target.dataset.effectsKey),180);
    });
    root.addEventListener('pointerout',event=>{if(event.target.closest('[data-effects-key]')&&!event.target.closest('[data-effects-key]').contains(event.relatedTarget)){clearTimeout(openTimer);delayedClose();}});
    root.addEventListener('focusin',event=>{
      if(suppressFocus || root.querySelector('dialog[open]'))return;
      const target=event.target.closest('[data-effects-key]');
      if(target&&!pinned)show(target,target.dataset.effectsKey);
    });
    root.addEventListener('focusout',delayedClose);
    root.addEventListener('click',event=>{
      const trigger=event.target.closest('[data-effects]');
      const touchNode=event.target.closest('.tree-node[data-effects-key]');
      if(trigger || touchNode&&(event.pointerType==='touch'||matchMedia('(hover:none)').matches)){
        event.preventDefault();event.stopPropagation();
        const target=(trigger || touchNode).closest('[data-effects-key]');
        show(target,trigger?.dataset.effects || touchNode.dataset.effectsKey,true);
      }
    },true);
    popup.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
    popup.addEventListener('pointerleave',delayedClose);
    popup.addEventListener('focusout',delayedClose);
    popup.addEventListener('click',event=>{
      if(event.target.closest('.effects-close'))dismiss();
      const inspect=event.target.closest('[data-effects-inspect]');
      if(inspect){const key=inspect.dataset.effectsInspect;close();onInspect(key);}
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!popup.hidden){event.preventDefault();dismiss();}},true);
    document.addEventListener('pointerdown',event=>{if(!popup.hidden&&!popup.contains(event.target)&&!anchor?.contains(event.target))close();});
    window.addEventListener('resize',()=>{if(!popup.hidden)position();});
    document.addEventListener('scroll',event=>{
      if(popup.hidden||popup.contains(event.target))return;
      if(!pinned){close();return;}
      const rect=anchor?.getBoundingClientRect();
      if(!rect||rect.bottom<0||rect.top>innerHeight||rect.right<0||rect.left>innerWidth)close();
      else position();
    },true);
    return {close,content,rich};
  }};
})();
