/* Teste de regressão estrutural. Não é um renderizador nem um teste no Figma. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let count=0;const fontLoads=[];
class Layer {
 constructor(name,type='FRAME',mode='VERTICAL',w=390,h=1){Object.assign(this,{id:'test:'+ ++count,name,type,layoutMode:mode,children:[],width:w,_h:h,_vertical:'FIXED',layoutSizingHorizontal:'FIXED',paddingTop:0,paddingBottom:0,itemSpacing:0,primaryAxisAlignItems:'MIN',counterAxisAlignItems:'MIN',minHeight:0});}
 get height(){if(this._vertical==='HUG'){const inner=this.layoutMode==='VERTICAL'?this.children.reduce((a,n)=>a+n.height,0)+this.itemSpacing*Math.max(0,this.children.length-1):Math.max(0,...this.children.map(n=>n.height));return Math.max(this.minHeight,inner+this.paddingTop+this.paddingBottom);}return this._h;}
 set layoutSizingVertical(v){assert(['HUG','FIXED','FILL'].includes(v));this._vertical=v;}
 get layoutSizingVertical(){return this._vertical;}
 resize(w,h){this.width=w;this._h=h;this._vertical='FIXED';this.layoutSizingHorizontal='FIXED';}
 resizeWithoutConstraints(w,h){this.resize(w,h);}
 appendChild(child){child.parent=this;this.children.push(child);return child;}
}
const page=new Layer('Página','PAGE','NONE',0,0);
const section=page.appendChild(new Layer('PetZona · Wireframes editáveis · 430 × 932','SECTION','NONE',2120,5870));
const cases=[];
function text(parent,name,h=22){const n=parent.appendChild(new Layer(name,'TEXT','NONE',140,h));n.characters=name;n.getStyledTextSegments=()=>[{fontName:{family:'Inter',style:'Regular'}}];return n;}
const unrelated=page.appendChild(new Layer('Outro projeto','SECTION','NONE',500,500));const unrelatedChild=unrelated.appendChild(new Layer('Linha','FRAME','HORIZONTAL',400,1));
const names=['00 · Login','01 · Início','02 · Produtos','03 · Produto','04 · Carrinho','05 · Pagamento','06 · Serviços','07 · Profissionais','08 · Perfil do profissional','09 · Agendamento','10 · Confirmação','Extra · Compra concluída','08 · Spa Pet','09 · Spa Pet','10 · Spa Pet','08 · Táxi Pet','09 · Táxi Pet','10 · Táxi Pet'];
for(const name of names){
 const root=section.appendChild(new Layer(name,'FRAME','VERTICAL',430,932));
 const header=root.appendChild(new Layer('Cabeçalho','FRAME','HORIZONTAL',430,64));text(header,'Título',28);
 const viewport=root.appendChild(new Layer('Conteúdo rolável','FRAME','VERTICAL',430,620));
 const content=viewport.appendChild(new Layer('Conteúdo · Auto Layout','FRAME','VERTICAL',430,1));
 const row=content.appendChild(new Layer('Linha','FRAME','HORIZONTAL',390,1));text(row,'Preço',24);text(row,'R$ 90,00',28);row.primaryAxisAlignItems='SPACE_BETWEEN';
 const field=content.appendChild(new Layer('Valor editável','FRAME','HORIZONTAL',390,1));field.paddingTop=field.paddingBottom=14;text(field,'Exemplo');
 const art=content.appendChild(new Layer('Ilustração / Spa','FRAME','VERTICAL',390,160));
 const button=content.appendChild(new Layer('Botão / Confirmar','INSTANCE','HORIZONTAL',390,48));text(button,'Confirmar');button.paddingTop=button.paddingBottom=13;button.reactions=[{trigger:'ON_CLICK',destination:'sample'}];
 const nav=root.appendChild(new Layer('Navegação inferior','FRAME','HORIZONTAL',430,1));const navItem=nav.appendChild(new Layer('Navegar / Início','FRAME','VERTICAL',120,1));text(navItem,'Início');
 const bottom=root.appendChild(new Layer('Área segura inferior · 22','FRAME','HORIZONTAL',430,22));
 cases.push({root,header,viewport,row,field,art,button,nav,bottom});
}
function all(n){return [n,...n.children.flatMap(all)];}
const initial=all(page).map(n=>({id:n.id,characters:n.characters,reactions:JSON.stringify(n.reactions)}));
const context=vm.createContext({figma:{loadFontAsync:async f=>fontLoads.push(f)},console});
vm.runInContext(fs.readFileSync(__dirname+'/figma-repair.js','utf8'),context);context.page=page;
(async()=>{
 assert.equal(vm.runInContext('petZonaImportedSections(page).length',context),1);
 assert(cases.every(c=>c.row.height===1));
 await vm.runInContext('repairPetZonaSections(petZonaImportedSections(page))',context);
 for(const c of cases){assert.equal(c.root.width,430);assert.equal(c.root.height,932);assert(c.row.height>=28);assert(c.field.height>=52);assert(c.button.height>=52);assert(c.nav.height>=50);assert.equal(c.header.height,64);assert.equal(c.art.height,160);assert.equal(c.bottom.height,22);assert.equal(c.viewport.layoutSizingVertical,'FILL');assert.equal(c.header.layoutSizingHorizontal,'FILL');}
 assert.equal(unrelatedChild.height,1,'Outro projeto não pode ser alterado');
 assert(fontLoads.length>0);
 await vm.runInContext('repairPetZonaSections(petZonaImportedSections(page))',context);
 assert.deepStrictEqual(all(page).map(n=>({id:n.id,characters:n.characters,reactions:JSON.stringify(n.reactions)})),initial,'Nós, conteúdo e conexões devem ser preservados');
 console.log('OK: regressão de altura de 1 px; 18 telas com dimensões preservadas; campos e botões com altura mínima; cabeçalho e área rolável responsivos; execução repetida sem novos nós; textos/conexões preservados; outro projeto intacto.');
})().catch(e=>{console.error(e);process.exitCode=1;});
