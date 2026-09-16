/* PetZona v2: reparo localizado da estrutura produzida pelo gerador v1.
   Mantém nós, textos, instâncias e conexões; não apaga nem duplica telas. */
const PETZONA_SECTION_NAME='PetZona · Wireframes editáveis · 430 × 932';

function petZonaImportedSections(page){
  return page.children.filter(n=>n.type==='SECTION'&&n.name===PETZONA_SECTION_NAME);
}

async function repairPetZonaSections(sections){
  const affected=new Set();
  const fontNames=new Map();
  const screenRoots=[];
  function visit(root,fn){fn(root);if('children' in root)for(const child of root.children)visit(child,fn);}
  for(const section of sections){
    visit(section,n=>{
      if(n.type==='TEXT')for(const seg of n.getStyledTextSegments(['fontName'])){
        fontNames.set(seg.fontName.family+'|'+seg.fontName.style,seg.fontName);
      }
    });
    screenRoots.push(...section.children.filter(n=>n.type==='FRAME'&&/^(?:\d{2} · |Extra · )/.test(n.name)));
  }
  // Fontes reais do arquivo são carregadas antes de qualquer ajuste de layout.
  for(const name of fontNames.values())await figma.loadFontAsync(name);
  const fixedHeights=new Map([
    ['Área segura superior · 48',48],['Cabeçalho',64],
    ['Área segura inferior · 22',22],['Abrir carrinho',44]
  ]);
  function auto(n){return 'layoutMode' in n&&(n.layoutMode==='VERTICAL'||n.layoutMode==='HORIZONTAL');}
  function mark(n){affected.add(n.id);}
  function normalise(n){
    // A estrutura interna de uma instância continua vinculada ao componente.
    if(n.type!=='INSTANCE'&&'children' in n)for(const child of n.children)normalise(child);
    if(!auto(n)||screenRoots.includes(n))return;
    if(n.name.startsWith('Ilustração / '))return; // Área da imagem tem altura deliberadamente fixa.
    if(n.name==='Conteúdo rolável'){
      n.layoutSizingVertical='FILL';n.layoutSizingHorizontal='FILL';
      n.clipsContent=true;n.overflowDirection='VERTICAL';mark(n);return;
    }
    if(fixedHeights.has(n.name)){
      const width=n.name==='Abrir carrinho'?44:n.width;
      n.resize(width,fixedHeights.get(n.name));
      n.layoutSizingVertical='FIXED';
      if(n.name!=='Abrir carrinho'&&auto(n.parent))n.layoutSizingHorizontal='FILL';
      mark(n);return;
    }
    // A altura sempre acompanha o conteúdo, independentemente da direção.
    // Na v1, linhas horizontais ficavam com counterAxis FIXED e apenas 1 px.
    n.layoutSizingVertical='HUG';
    if(n.name.startsWith('Botão / ')){
      const isIcon=n.width<=48||n.name==='Botão / icon';
      if(isIcon){n.paddingTop=n.paddingBottom=8;n.minHeight=44;}
      else n.minHeight=n.name.includes('compacto')?44:52;
    }
    if(n.name==='Valor editável')n.minHeight=Math.max(52,n.minHeight||0);
    if(n.name.startsWith('Navegar / '))n.minHeight=50;
    if(n.name==='Navegação inferior')n.counterAxisAlignItems='CENTER';
    if(n.name.startsWith('Etiqueta / '))n.layoutSizingHorizontal='HUG';
    // Alinha valores ao lado direito nas linhas de resumo, sem esticar o preço.
    if(n.layoutMode==='HORIZONTAL'&&n.primaryAxisAlignItems==='SPACE_BETWEEN'&&n.children.length===2){
      const last=n.children[1];
      if(last.type==='TEXT'){
        last.textAutoResize='WIDTH_AND_HEIGHT';last.layoutSizingHorizontal='HUG';
        last.textAlignHorizontal='RIGHT';mark(last);
      }
    }
    mark(n);
  }
  for(const section of sections)normalise(section);
  for(const root of screenRoots){
    root.resize(430,932);root.layoutSizingHorizontal='FIXED';root.layoutSizingVertical='FIXED';
    root.itemSpacing=0;root.clipsContent=true;
    for(const child of root.children){
      if(!auto(child))continue;
      child.layoutSizingHorizontal='FILL';
      if(child.name==='Conteúdo rolável')child.layoutSizingVertical='FILL';
      else if(fixedHeights.has(child.name))child.layoutSizingVertical='FIXED';
      else child.layoutSizingVertical='HUG';
      mark(child);
    }
    mark(root);
  }
  for(const section of sections){
    const sheet=section.children.find(n=>n.name==='Componentes e guia'&&n.type==='FRAME');
    if(sheet){
      sheet.layoutSizingVertical='HUG';
      // O painel acompanha a altura real dos componentes corrigidos.
      const bottom=section.children.reduce((y,n)=>Math.max(y,n.y+n.height),0);
      section.resizeWithoutConstraints(section.width,Math.max(5870,bottom+40));mark(section);
    }
  }
  const audit=[];
  for(const root of screenRoots){
    const body=root.children.find(n=>n.name==='Conteúdo rolável');
    const flat=[];visit(root,n=>{if(auto(n)&&n.children.length&&n.height<2&&!n.name.startsWith('Ícone / '))flat.push(n.name);});
    audit.push({screen:root.name,width:root.width,height:root.height,bodyFills:!!body&&body.layoutSizingVertical==='FILL',collapsedContainers:flat});
  }
  return {screenRoots,affectedNodeIds:[...affected],audit};
}
