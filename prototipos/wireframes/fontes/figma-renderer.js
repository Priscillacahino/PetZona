/* Gerador para a API nativa de plugins do Figma. Executado apenas pelo usuário. */
async function createPetZona(){
  const existing=petZonaImportedSections(figma.currentPage);
  if(existing.length){
    const repaired=await repairPetZonaSections(existing);
    const home=repaired.screenRoots.find(n=>n.name==='01 · Início')||repaired.screenRoots[0];
    if(home){figma.currentPage.selection=[home];figma.viewport.scrollAndZoomIntoView([home]);}
    const problems=repaired.audit.filter(n=>n.collapsedContainers.length||!n.bodyFills);
    console.log('PetZona · Auditoria de layout',JSON.stringify(repaired.audit));
    figma.closePlugin(problems.length?'PetZona: ajuste aplicado; confira o relatório no console.':'PetZona: '+repaired.screenRoots.length+' telas reorganizadas.');
    return;
  }
  const fonts={400:'Regular',500:'Medium',600:'Semi Bold',700:'Bold',800:'Bold'};
  for(const style of ['Regular','Medium','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style});
  const color=k=>{const h=(PZ.C[k]||k||PZ.C.ink).replace('#','');return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255};};
  const paint=k=>[{type:'SOLID',color:color(k)}];
  const page=figma.currentPage;
  const bottom=page.children.reduce((v,n)=>Math.max(v,n.y+n.height),0);
  const section=figma.createSection();section.name='PetZona · Wireframes editáveis · 430 × 932';section.x=0;section.y=page.children.length>1?bottom+240:0;section.resizeWithoutConstraints(2120,5870);section.fills=paint('baby');
  const components=figma.createFrame();section.appendChild(components);components.name='Componentes e guia';components.x=40;components.y=5020;components.resize(2020,810);components.layoutMode='HORIZONTAL';components.primaryAxisSizingMode='FIXED';components.counterAxisSizingMode='FIXED';components.itemSpacing=24;components.paddingLeft=24;components.paddingRight=24;components.paddingTop=24;components.paddingBottom=24;components.fills=paint('white');components.cornerRadius=24;components.clipsContent=false;
  const masters=figma.createFrame();components.appendChild(masters);masters.name='Botões · componentes principais';masters.resize(390,100);masters.layoutMode='VERTICAL';masters.primaryAxisSizingMode='AUTO';masters.counterAxisSizingMode='FIXED';masters.itemSpacing=12;masters.fills=[];
  const styles={};
  for(const [name,value] of Object.entries(PZ.C)){const style=figma.createPaintStyle();style.name='PetZona / '+name;style.paints=paint(value);styles[name]=style;}
  const typography={};
  for(const size of [12,13,14,15,16,17,18,19,20,23,24,25,26,28,30])for(const weight of [400,600,700]){const s=figma.createTextStyle();s.name='PetZona / '+size+' / '+weight;s.fontName={family:'Inter',style:fonts[weight]};s.fontSize=size;s.lineHeight={unit:'PERCENT',value:140};typography[size+'-'+weight]=s;}
  async function fill(n,key){if(styles[key])await n.setFillStyleIdAsync(styles[key].id);else n.fills=paint(key);}
  function frame(name,mode='VERTICAL',width=390){const n=figma.createFrame();n.name=name;n.layoutMode=mode;n.resize(width,1);n.primaryAxisSizingMode=mode==='VERTICAL'?'AUTO':'FIXED';n.counterAxisSizingMode=mode==='VERTICAL'?'FIXED':'AUTO';n.itemSpacing=12;n.fills=[];n.clipsContent=false;return n;}
  function append(parent,n,fillWidth=true){parent.appendChild(n);if(fillWidth)n.layoutSizingHorizontal='FILL';return n;}
  async function textNode(str,size=16,weight=400,key='ink',width=390){const n=figma.createText();n.name=str.slice(0,48);n.fontName={family:'Inter',style:fonts[weight]||'Regular'};n.fontSize=size;n.lineHeight={unit:'PERCENT',value:140};n.characters=str;n.resize(Math.max(width,20),size*1.4);n.textAutoResize='HEIGHT';if(typography[size+'-'+weight])await n.setTextStyleIdAsync(typography[size+'-'+weight].id);await fill(n,key);return n;}
  function svgNode(key,size=24,keyColor='plum'){const n=figma.createNodeFromSvg(PZ.svg(key,PZ.C[keyColor]||PZ.C.plum,size));n.name='Ícone / '+key;n.resize(size,size);return n;}
  const buttonCache={};let masterCount=0;
  async function button(n,width){
    const cacheKey=n.kind+(n.icon?'-'+n.icon:'')+(n.small?'-compacto':'');
    let main=buttonCache[cacheKey];
    if(!main){
      main=figma.createComponent();main.name='Botão / '+cacheKey;masters.appendChild(main);main.layoutMode='HORIZONTAL';main.resize(350,n.kind==='icon'||n.small?44:52);main.primaryAxisSizingMode='FIXED';main.counterAxisSizingMode='AUTO';main.primaryAxisAlignItems=n.kind==='search'?'MIN':'CENTER';main.counterAxisAlignItems='CENTER';main.paddingLeft=14;main.paddingRight=14;main.paddingTop=n.small?11:13;main.paddingBottom=n.small?11:13;main.itemSpacing=8;main.cornerRadius=14;main.clipsContent=false;
      await fill(main,n.kind==='primary'?'plum':n.kind==='secondary'?'lilac':n.kind==='search'?'white':'surface');
      if(['chip','icon','search'].includes(n.kind)){main.strokes=paint('line');main.strokeWeight=1;}
      if(n.icon)main.appendChild(svgNode(n.icon,21,n.kind==='primary'?'white':'plum'));
      const label=await textNode('Botão',n.small?13:16,600,n.kind==='primary'?'white':n.kind==='secondary'?'plum':'ink',290);label.name='Rótulo';main.appendChild(label);label.layoutSizingHorizontal='FILL';label.textAlignHorizontal=n.kind==='search'?'LEFT':'CENTER';buttonCache[cacheKey]=main;masterCount++;
    }
    const instance=main.createInstance();instance.name='Botão / '+n.text;instance.resize(n.kind==='icon'?44:Math.max(80,width),instance.height);instance.counterAxisSizingMode='AUTO';instance.minHeight=n.kind==='icon'||n.small?44:52;if(n.kind==='icon')instance.paddingTop=instance.paddingBottom=8;const label=instance.findOne(x=>x.type==='TEXT'&&x.name==='Rótulo');label.characters=n.text;return instance;
  }
  const links=[];
  async function node(n,parent,width,state){
    let result;
    if(n.type==='text'){
      result=await textNode(n.text,n.size,n.weight,n.color,width);
      if(n.bg){const wrap=frame('Etiqueta / '+n.text,'HORIZONTAL',width);wrap.paddingLeft=wrap.paddingRight=n.pad||0;wrap.paddingTop=wrap.paddingBottom=n.pad||0;wrap.cornerRadius=n.radius||0;await fill(wrap,n.bg);wrap.appendChild(result);result.textAutoResize='WIDTH_AND_HEIGHT';result.layoutSizingHorizontal='HUG';wrap.primaryAxisSizingMode='AUTO';result=wrap;}
    }else if(n.type==='icon'){result=svgNode(n.key,n.size,n.color);
    }else if(n.type==='line'){result=figma.createRectangle();result.name='Divisor';result.resize(width,1);await fill(result,'line');
    }else if(n.type==='button'){result=await button(n,width);
    }else if(n.type==='art'){
      result=frame('Ilustração / '+(n.label||n.key),'VERTICAL',n.width||width);result.resize(n.width||width,n.height);result.primaryAxisSizingMode='FIXED';result.counterAxisSizingMode='FIXED';result.primaryAxisAlignItems='CENTER';result.counterAxisAlignItems='CENTER';result.cornerRadius=16;result.itemSpacing=12;await fill(result,n.bg);result.appendChild(svgNode(n.key,Math.min(n.height*.42,72),n.color||'plum'));
      if(n.label){const label=await textNode(n.label,12,600,n.color||'plum',Math.max(20,width-24));result.appendChild(label);label.layoutSizingHorizontal='FILL';label.textAlignHorizontal='CENTER';result.paddingLeft=result.paddingRight=12;}
    }else if(n.type==='field'||n.type==='select'){
      result=frame('Campo / '+n.label,'VERTICAL',width);result.itemSpacing=8;append(result,await textNode(n.label,14,600,'ink',width));
      const input=frame('Valor editável','HORIZONTAL',width);input.paddingTop=input.paddingBottom=14;input.paddingLeft=input.paddingRight=14;input.cornerRadius=12;input.strokes=paint('line');input.strokeWeight=1;await fill(input,'white');input.counterAxisAlignItems='CENTER';append(result,input);
      append(input,await textNode(n.value||n.placeholder||'Preencher',16,400,n.value?'ink':'muted',width-28));
      if(n.type==='select')input.appendChild(svgNode('chevron',18,'muted'));
      if(n.multiline)input.minHeight=88;
    }else{
      result=frame(n.name||(n.type==='row'?'Linha':'Grupo'),n.type==='row'?'HORIZONTAL':'VERTICAL',width);
      result.itemSpacing=n.gap===undefined?12:n.gap;
      if(n.align)result.counterAxisAlignItems=n.align==='center'?'CENTER':n.align==='end'?'MAX':'MIN';
      if(n.justify==='between')result.primaryAxisAlignItems='SPACE_BETWEEN';
      if(n.pad)result.paddingLeft=result.paddingRight=result.paddingTop=result.paddingBottom=n.pad;
      if(n.radius)result.cornerRadius=n.radius;
      if(n.bg)await fill(result,n.bg);
      if(n.border){result.strokes=paint(n.border);result.strokeWeight=1;}
      // Native Auto Layout uses Fill container for the flexible columns.
      const inside=width-2*(n.pad||0), gap=result.itemSpacing;
      const childWidth=n.type==='row'?(inside-gap*(n.children.length-1))/n.children.length:inside;
      for(const child of n.children)await node(child,result,child.width||Math.max(32,childWidth),state);
    }
    parent.appendChild(result);
    if(n.type==='icon'||n.fixed||n.width||n.type==='button'&&n.kind==='icon'){
      result.layoutSizingHorizontal='FIXED';
      if(n.type==='text'&&!n.bg)result.textAutoResize='WIDTH_AND_HEIGHT';
      if(n.fixed&&['col','row'].includes(n.type))result.layoutSizingHorizontal='HUG';
    }else result.layoutSizingHorizontal='FILL';
    if(n.action)links.push({node:result,action:n.action,state});
    return result;
  }
  async function brand(parent,width){const row=frame('PetZona / marca','HORIZONTAL',width);row.itemSpacing=7;row.counterAxisAlignItems='CENTER';row.appendChild(svgNode('paw',28));const word=await textNode('PetZona',27,700,'ink',150);word.textAutoResize='WIDTH_AND_HEIGHT';word.setRangeFills(3,7,paint('plum'));row.appendChild(word);parent.appendChild(row);row.layoutSizingHorizontal='FILL';return row;}
  const screens={},frames=[];
  for(let index=0;index<PZ.frameSpecs.length;index++){
    const spec=PZ.frameSpecs[index],state=PZ.frameState(spec),sc=PZ.screen(state),key=state.route+'-'+state.service;
    const root=frame(spec[1],'VERTICAL',430);section.appendChild(root);root.x=40+(index%4)*520;root.y=100+Math.floor(index/4)*980;root.resize(430,932);root.primaryAxisSizingMode='FIXED';root.counterAxisSizingMode='FIXED';root.itemSpacing=0;root.clipsContent=true;root.cornerRadius=28;await fill(root,'white');frames.push(root);screens[key]=root;
    const status=frame('Área segura superior · 48','HORIZONTAL');append(root,status);status.resize(430,48);status.primaryAxisSizingMode='FIXED';status.counterAxisSizingMode='FIXED';status.paddingLeft=status.paddingRight=27;status.primaryAxisAlignItems='SPACE_BETWEEN';status.counterAxisAlignItems='CENTER';status.appendChild(await textNode('9:41',12,600,'ink',45));const island=figma.createRectangle();island.name='Dynamic Island';island.resize(110,27);island.cornerRadius=20;await fill(island,'ink');status.appendChild(island);status.appendChild(await textNode('•••  ▰',12,600,'ink',45));
    const header=frame('Cabeçalho','HORIZONTAL');append(root,header);header.resize(430,64);header.primaryAxisSizingMode='FIXED';header.counterAxisSizingMode='FIXED';header.paddingLeft=header.paddingRight=20;header.itemSpacing=10;header.counterAxisAlignItems='CENTER';
    if(sc.back)await node(PZ.btn('‹','go:'+sc.back,{kind:'icon'}),header,44,state);
    if(sc.title==='PetZona')await brand(header,280);else append(header,await textNode(sc.title,19,700,'ink',260));
    if(state.route!=='login'){const cart=frame('Abrir carrinho','HORIZONTAL',44);cart.resize(44,44);cart.primaryAxisSizingMode='FIXED';cart.counterAxisSizingMode='FIXED';cart.primaryAxisAlignItems='CENTER';cart.counterAxisAlignItems='CENTER';cart.strokes=paint('line');cart.cornerRadius=14;cart.appendChild(svgNode('cart',21));header.appendChild(cart);links.push({node:cart,action:'go:cart',state});}
    const viewport=frame('Conteúdo rolável','VERTICAL',430);append(root,viewport);viewport.resize(430,620);viewport.layoutSizingVertical='FILL';viewport.primaryAxisSizingMode='FIXED';viewport.clipsContent=true;viewport.overflowDirection='VERTICAL';viewport.itemSpacing=0;
    const body=frame('Conteúdo · Auto Layout','VERTICAL',430);append(viewport,body);body.paddingLeft=body.paddingRight=20;body.paddingTop=16;body.paddingBottom=24;body.itemSpacing=20;
    for(const item of sc.body)await node(item,body,390,state);
    if(sc.footer.length){const footer=frame('Ação fixa','VERTICAL');append(root,footer);footer.paddingLeft=footer.paddingRight=20;footer.paddingTop=footer.paddingBottom=12;for(const item of sc.footer)await node(item,footer,390,state);}
    if(sc.nav){const nav=frame('Navegação inferior','HORIZONTAL');append(root,nav);nav.paddingLeft=nav.paddingRight=20;nav.paddingTop=10;nav.paddingBottom=8;nav.itemSpacing=8;for(const [id,ic,label] of [['home','home','Início'],['products','bag','Produtos'],['services','paw','Serviços']]){const item=frame('Navegar / '+label,'VERTICAL',120);append(nav,item);item.paddingTop=item.paddingBottom=6;item.itemSpacing=5;item.counterAxisAlignItems='CENTER';item.cornerRadius=12;if(sc.active===id)await fill(item,'lilac');item.appendChild(svgNode(ic,22,sc.active===id?'plum':'muted'));const txt=await textNode(label,12,sc.active===id?600:400,sc.active===id?'plum':'muted',100);append(item,txt);txt.textAlignHorizontal='CENTER';links.push({node:item,action:'go:'+id,state});}}
    const bottomBar=frame('Área segura inferior · 22','HORIZONTAL');append(root,bottomBar);bottomBar.resize(430,22);bottomBar.primaryAxisSizingMode='FIXED';bottomBar.counterAxisSizingMode='FIXED';bottomBar.primaryAxisAlignItems='CENTER';bottomBar.counterAxisAlignItems='CENTER';const indicator=figma.createRectangle();indicator.resize(132,4);indicator.cornerRadius=4;await fill(indicator,'ink');bottomBar.appendChild(indicator);
  }
  function destination(action,state){const [a,...rest]=action.split(':'),v=rest.join(':');let route=null,service=state.service;
    if(a==='go')route=v;else if(a==='product')route='product';else if(a==='category'||a==='clearSearch')route='products';else if(a==='service'){route='provider';service=v;}else if(a==='addCart')route='cart';else if(a==='book')route='confirmation';else if(a==='editBooking')route='booking';else if(a==='login')route='home';
    return route&&(screens[route+'-'+service]||screens[route+'-bath']);
  }
  let linkCount=0;
  for(const link of links){const target=destination(link.action,link.state);if(target){await link.node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:target.id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',easing:{type:'EASE_OUT'},duration:.15},resetScrollPosition:true}]}]);linkCount++;}}
  const heading=await textNode('PetZona  /  Wireframes de média fidelidade',28,700,'ink',1900);section.appendChild(heading);heading.x=40;heading.y=34;
  const guide=frame('Guia / responsividade e fluxos','VERTICAL',660);components.appendChild(guide);guide.itemSpacing=18;
  for(const n of [PZ.t('Para editar e prototipar',28,700),PZ.t('10 telas principais + login + 7 variações de jornada.',18,600),PZ.t('Base: iPhone 16 Plus · 430 × 932\nRedimensione a largura do frame, sem usar a ferramenta Scale.\nOs grupos usam Auto Layout e Fill container. Conteúdo longo rola dentro da área central.',16),PZ.t('Estrutura\nMargens 20 · espaço 8 / 12 / 16 / 20 / 24\nBotões 52 · alvos compactos 44\nTexto 16 · legendas 12–14\nCabeçalho 64 · áreas seguras 48 / 22',16),PZ.t('Fluxos\nProdutos → detalhe → carrinho → pagamento → confirmação\nServiços → profissional → agendamento → confirmação\nVariações próprias: Spa Pet e Táxi Pet.',16),PZ.t('Limites do protótipo Figma\nLinks conectam cenários predefinidos. Campos, filtros, quantidades e horários são editáveis no arquivo; suas alterações interativas estão demonstradas no HTML. As fotos finais podem substituir os vetores.',14,400,'muted'),PZ.t('Origem acadêmica\nWorkshop da Fábrica de Software 2026.1 · processo de avaliação para a equipe UX/UI do Adm4All. Dados e preços demonstrativos.',14,400,'muted')])await node(n,guide,660,PZ.initial);
  const palette=frame('Paleta','VERTICAL',370);components.appendChild(palette);for(const [name,hex] of Object.entries(PZ.C)){await node(PZ.row([PZ.t('    ',16,400,'ink',{bg:name,pad:5,radius:8,fixed:true}),PZ.t(name+'   '+hex,14,600)],{gap:10}),palette,370,PZ.initial);}
  // Reflow component masters into two columns if more than one column is needed.
  masters.resize(390,masters.height);if(masters.height>720){masters.layoutMode='HORIZONTAL';masters.layoutWrap='WRAP';masters.primaryAxisSizingMode='FIXED';masters.counterAxisSizingMode='AUTO';masters.resize(740,masters.height);for(const m of masters.children)m.resize(350,m.height);}
  page.flowStartingPoints=[...page.flowStartingPoints,{nodeId:screens['login-bath'].id,name:'PetZona · Entrada e compras'},{nodeId:screens['services-bath'].id,name:'PetZona · Serviços'}];
  await repairPetZonaSections([section]);
  page.selection=[screens['home-bath']];figma.viewport.scrollAndZoomIntoView([screens['home-bath']]);
  figma.closePlugin('PetZona: '+frames.length+' telas editáveis e '+linkCount+' conexões criadas.');
}
createPetZona().catch(error=>{console.error(error);figma.closePlugin('Não foi possível concluir. '+String(error.message||error));});
