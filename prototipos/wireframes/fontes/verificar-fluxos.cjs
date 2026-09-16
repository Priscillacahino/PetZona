/* Verificação da lógica em Node. Não substitui teste de navegador ou Figma. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();
function element(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',scrollTop:0,hidden:false,style:{setProperty(){}},addEventListener(){},setAttribute(){},focus(){},setSelectionRange(){},classList:{toggle(){}}});return elements.get(key);}
const ctx=vm.createContext({document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){},documentElement:element('root')},window:{},history:{replaceState(){}},location:{hash:''},setTimeout:()=>0,clearTimeout(){},console});
const root=__dirname;
vm.runInContext(fs.readFileSync(root+'/modelo.js','utf8')+'\n'+fs.readFileSync(root+'/preview.js','utf8'),ctx);
const run=code=>vm.runInContext(code,ctx);
run("act('product:water');act('qty:1');act('qty:1');act('addCart')");
assert.equal(run('state.route'),'cart');assert.equal(run('state.cartQty'),3);assert(element('#content').innerHTML.includes('284,70'));
run("act('cartQty:-1');act('go:checkout');act('payment:Cartão')");
assert.equal(run('state.payment'),'Cartão');assert(element('#content').innerHTML.includes('194,80'));
run("state.address='Endereço de teste';render();act('payment:Pix')");assert(element('#content').innerHTML.includes('Endereço de teste'));
run("act('go:purchased')");assert(element('#content').innerHTML.includes('194,80'));
run("act('product:toy');act('go:cart')");assert(element('#content').innerHTML.includes('Bebedouro automático'));
run("act('removeCart');act('go:checkout')");assert.equal(run('state.route'),'cart');assert(element('#content').innerHTML.includes('vazio'));
run("act('service:spa');act('go:booking');act('date:22');act('book')");assert.equal(run('state.route'),'confirmation');assert(element('#content').innerHTML.includes('Spa Pet'));assert(element('#content').innerHTML.includes('22 set 2026'));assert(element('#content').innerHTML.includes('8h às 18h'));assert(element('#content').innerHTML.includes('90,00'));
run("act('service:taxi');act('go:booking');state.taxiFrom='';act('book')");assert.equal(run('state.route'),'booking');
run("state.taxiFrom='Casa de exemplo';state.taxiTo='PetZona Centro';act('toggleReturn');act('time:14:00');act('book')");assert(element('#content').innerHTML.includes('120,00'));assert(element('#content').innerHTML.includes('14:00'));assert(element('#content').innerHTML.includes('Casa de exemplo'));
run("act('editBooking')");assert.equal(run('state.service'),'taxi');assert.equal(run('state.taxiReturn'),true);
run("state.search='INEXISTENTE';navigate('products')");assert(element('#content').innerHTML.includes('Nenhum produto encontrado'));
run("act('clearSearch');act('category:Aves')");assert(element('#content').innerHTML.includes('Comedouro para aves'));assert(!element('#content').innerHTML.includes('Bebedouro automático'));
const scenarios=JSON.parse(run('JSON.stringify(PZ.frameSpecs.map(spec=>PZ.screen(PZ.frameState(spec))))'));
assert.equal(scenarios.length,18);
function walk(n){assert(n.type);if(n.type==='text'){assert.equal(typeof n.text,'string');assert.equal(typeof n.color,'string');}if(n.children)n.children.forEach(walk);}
scenarios.forEach(s=>{s.body.forEach(walk);s.footer.forEach(walk);assert(!JSON.stringify(s).includes('NaN'));});
console.log('OK: 18 cenários; carrinho e totais; endereço; pagamento; Spa Pet; Táxi Pet ida/volta; alteração de reserva; validação de endereços; busca e filtros.');
