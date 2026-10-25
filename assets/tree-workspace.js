/* Give the tree the viewport; keep filters and calculations in a collapsible sidebar. */
(() => {
  'use strict';
  if(document.body.dataset.view!=='tree')return;
  const app=document.querySelector('#building-app');
  const workspace=app?.querySelector('.workspace');
  if(!workspace)return;
  const sidebar=workspace.querySelector('.filters');
  const results=workspace.querySelector('.results');
  const toolbar=results.querySelector('.toolbar');
  const diagram=results.querySelector('#results');
  sidebar.id='tree-filters-panel';
  sidebar.querySelector('h2').textContent='Filters';
  const closeSidebar=document.createElement('button');
  closeSidebar.type='button';
  closeSidebar.className='tree-sidebar-close';
  closeSidebar.textContent='Close ×';
  sidebar.prepend(closeSidebar);

  const bonusFields=sidebar.querySelector('fieldset');
  const bonusFilters=document.createElement('details');
  bonusFilters.className='tree-bonus-filters';
  bonusFilters.innerHTML='<summary>Infrastructure filter <small id="tree-filter-state"></small></summary>';
  bonusFields.before(bonusFilters);
  bonusFilters.append(bonusFields);
  sidebar.querySelector('#sort').closest('.field').after(bonusFilters);
  bonusFilters.open=!!bonusFields.querySelector('input:checked');

  const calculator=results.querySelector('.savings');
  const savingsPanel=document.createElement('details');
  savingsPanel.className='tree-savings-panel';
  savingsPanel.innerHTML='<summary>Savings & bonuses <small id="tree-savings-state"></small></summary>';
  savingsPanel.append(calculator);
  calculator.querySelector('h2').classList.add('sr-only');
  const headings=calculator.querySelectorAll('thead th');
  ['Bonus','#','Gold','Prod.'].forEach((label,i)=>{headings[i].setAttribute('aria-label',headings[i].textContent);headings[i].textContent=label;});
  sidebar.querySelector('.reset').after(savingsPanel);
  const sources=document.createElement('a');
  sources.className='tree-workspace-sources';
  sources.href='mechanics.html#sources';
  sources.textContent='Mechanics & sources ↗';
  sidebar.append(sources);

  const heading=document.createElement('div');
  heading.className='tree-workspace-heading';
  heading.innerHTML='<button id="tree-filters-toggle" type="button" aria-controls="tree-filters-panel" aria-expanded="true">Filters</button><h1>Building tree</h1>';
  heading.append(toolbar.querySelector('#result-count'));
  toolbar.prepend(heading);
  const picker=document.createElement('select');
  picker.id='tree-chain-picker';
  picker.setAttribute('aria-label','Jump to a building chain');
  toolbar.insertBefore(picker,toolbar.querySelector('.view-switch'));
  const backdrop=document.createElement('button');
  backdrop.type='button';
  backdrop.className='tree-sidebar-backdrop';
  backdrop.setAttribute('aria-label','Close filters');
  workspace.append(backdrop);
  const toggle=heading.querySelector('button');
  function setSidebar(open){
    workspace.classList.toggle('filters-hidden',!open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.classList.toggle('is-active',open);
    if(open&&matchMedia('(max-width:850px)').matches)sidebar.querySelector('#search').focus({preventScroll:true});
    window.dispatchEvent(new Event('resize'));
  }
  toggle.addEventListener('click',()=>setSidebar(workspace.classList.contains('filters-hidden')));
  const hideSidebar=()=>{setSidebar(false);toggle.focus({preventScroll:true});};
  closeSidebar.addEventListener('click',hideSidebar);
  backdrop.addEventListener('click',hideSidebar);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&matchMedia('(max-width:850px)').matches&&!workspace.classList.contains('filters-hidden')&&!document.querySelector('dialog[open]'))hideSidebar();
  });
  setSidebar(!matchMedia('(max-width:850px)').matches);

  function updateNavigation(){
    const sections=[...diagram.querySelectorAll('.tree-component')];
    picker.replaceChildren(new Option('Jump to a chain…',''));
    sections.forEach((section,i)=>{
      section.dataset.chainIndex=i;
      const title=section.querySelector('.component-title')?.textContent || 'Buildings';
      const label=section.querySelector('.standalone-nodes') ? `Standalone buildings (${section.querySelectorAll('.tree-node').length})` : title;
      picker.append(new Option(label,String(i)));
    });
    picker.disabled=!sections.length;
    const count=sidebar.querySelectorAll('.skill-toggle input:checked').length;
    sidebar.querySelector('#tree-filter-state').textContent=count ? count+' selected' : 'All buildings';
    const included=calculator.querySelectorAll('tbody input:checked').length;
    sidebar.querySelector('#tree-savings-state').textContent=`${included} bonuses · ${calculator.querySelector('#savings-boosted').checked ? 'Boosted' : 'Unboosted'}`;
  }
  picker.addEventListener('change',()=>{
    if(picker.value==='')return;
    const scroll=diagram.querySelector('.tree-scroll');
    const section=diagram.querySelector(`[data-chain-index="${picker.value}"]`);
    if(scroll&&section)scroll.scrollTo({left:0,top:scroll.scrollTop+section.getBoundingClientRect().top-scroll.getBoundingClientRect().top-16});
  });
  new MutationObserver(updateNavigation).observe(diagram,{childList:true});
  updateNavigation();
})();
