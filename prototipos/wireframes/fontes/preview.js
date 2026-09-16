const state={...PZ.initial};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors=PZ.C;
const styles=n=>[n.bg?'background:'+colors[n.bg]:'',n.border?'border:1px solid '+colors[n.border]:'',n.radius!==undefined?'border-radius:'+n.radius+'px':'',n.pad!==undefined?'padding:'+n.pad+'px':'',n.gap!==undefined?'gap:'+n.gap+'px':'',n.align?'align-items:'+n.align:'',n.justify==='between'?'justify-content:space-between':'',n.wrap?'flex-wrap:wrap':'',n.width?'width:'+n.width+'px;flex:0 0 '+n.width+'px':''].filter(Boolean).join(';');
function renderNode(n){
 const fixed=n.fixed?' is-fixed':'';
 if(n.type==='text')return `<p class="pz-text${fixed}" style="${styles(n)};font-size:${n.size}px;font-weight:${n.weight};color:${colors[n.color]||colors.ink}">${esc(n.text)}</p>`;
 if(n.type==='icon')return `<span class="is-fixed" aria-hidden="true">${PZ.svg(n.key,colors[n.color],n.size)}</span>`;
 if(n.type==='art')return `<div class="pz-art${n.width?' is-fixed':''}" style="${styles(n)};height:${n.height}px">${PZ.svg(n.key,colors[n.color]||colors.plum,Math.min(n.height*.42,72))}${n.label?'<span>'+esc(n.label)+'</span>':''}</div>`;
 if(n.type==='button')return `<button type="button" class="pz-button ${n.kind} ${n.small?'small':''}${fixed}" data-action="${esc(n.action)}" ${n.label?'aria-label="'+esc(n.label)+'"':''}>${n.icon?PZ.svg(n.icon,n.kind==='primary'?colors.white:colors.plum,21):''}${esc(n.text)}</button>`;
 if(n.type==='field'||n.type==='select'){
  const id='field-'+n.key;
  const attrs=`id="${id}" data-field="${n.key}"`;
  return `<div class="pz-field"><label for="${id}">${esc(n.label)}</label>${n.type==='select'?`<select ${attrs}>${n.options.map(o=>`<option ${o===n.value?'selected':''}>${esc(o)}</option>`).join('')}</select>`:n.multiline?`<textarea ${attrs} placeholder="${esc(n.placeholder||'')}">${esc(n.value)}</textarea>`:`<input ${attrs} type="${n.inputType||'text'}" value="${esc(n.value)}" placeholder="${esc(n.placeholder||'')}" ${n.inputType==='password'?'autocomplete="off"':''}>`}</div>`;
 }
 if(n.type==='line')return '<div class="pz-line"></div>';
 const tag=n.action?'button':'div';
 return `<${tag} class="pz-${n.type}${fixed}${n.action?' pz-clickable':''}" style="${styles(n)}" ${n.action?'type="button" data-action="'+esc(n.action)+'"':''}>${n.children.map(renderNode).join('')}</${tag}>`;
}
const brand=()=>`<div class="brand">${PZ.svg('paw',colors.plum,29)}<span>Pet<em>Zona</em></span></div>`;
const names={login:'00 · Login',home:'01 · Início',products:'02 · Produtos',product:'03 · Produto',cart:'04 · Carrinho',checkout:'05 · Pagamento',services:'06 · Serviços',professionals:'07 · Profissionais',provider:'08 · Perfil do profissional',booking:'09 · Agendamento',confirmation:'10 · Confirmação',purchased:'Extra · Compra concluída'};
function render(preserveScroll=false){
 const y=$('.body')?.scrollTop||0;
 const sc=PZ.screen(state);
 $('#app-header').innerHTML=(sc.back?`<button class="round" aria-label="Voltar" data-action="go:${sc.back}">${PZ.svg('arrow',colors.ink,20)}</button>`:'')+(sc.title==='PetZona'?brand():`<h2>${esc(sc.title)}</h2>`)+(state.route!=='login'?`<button class="round" aria-label="Abrir carrinho" data-action="go:cart">${PZ.svg('cart',colors.plum,21)}${state.cartQty?'<span class="count">'+state.cartQty+'</span>':''}</button>`:'');
 $('#content').innerHTML=sc.body.map(renderNode).join('');
 $('#app-footer').innerHTML=sc.footer.map(renderNode).join('');
 $('#app-nav').innerHTML=sc.nav?[['home','home','Início'],['products','bag','Produtos'],['services','paw','Serviços']].map(([id,icon,name])=>`<button class="${sc.active===id?'active':''}" data-action="go:${id}" ${sc.active===id?'aria-current="page"':''}>${PZ.svg(icon,sc.active===id?colors.plum:colors.muted,22)}${name}</button>`).join(''):'';
 $('#app-nav').hidden=!sc.nav;
 $('.body').scrollTop=preserveScroll?y:0;
 document.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route));
 $('#screen-select').value=state.route;
 $('#screen-caption').textContent=names[state.route]+' · '+(state.service==='spa'?'Spa Pet':state.service==='taxi'?'Táxi Pet':'PetZona');
 document.title=(names[state.route]||'PetZona')+' | PetZona';
 $('#app-header h2')?.setAttribute('tabindex','-1');
}
function toast(msg){$('#toast').textContent=msg;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').textContent='',3500);}
function navigate(route){
 state.route=route;
 if(route==='checkout'&&!state.cartQty){state.route='cart';toast('Adicione um produto para continuar.');}
 if(route==='confirmation'&&!state.booking){state.booked=true;state.booking={...state,route:'confirmation',booking:null};}
 history.replaceState(null,'','#'+state.route);
 render();
}
function act(action){
 const [a,...rest]=action.split(':'),value=rest.join(':');
 if(a==='go'){navigate(value);return;}
 if(a==='product'){state.product=value;state.qty=1;navigate('product');return;}
 if(a==='service'){state.service=value;state.notes='';state.time='11:30';navigate('provider');return;}
 if(a==='category'){state.category=value;navigate('products');return;}
 if(a==='filter'){state.filter=value;render(true);return;}
 if(a==='clearSearch'){state.search='';state.category='Todos';render();return;}
 if(a==='qty'){state.qty=Math.min(9,Math.max(1,state.qty+Number(value)));render(true);return;}
 if(a==='cartQty'){state.cartQty=Math.min(9,Math.max(0,state.cartQty+Number(value)));render(true);return;}
 if(a==='removeCart'){state.cartQty=0;render();return;}
 if(a==='addCart'){const replaced=state.cartQty&&state.cartProduct!==state.product;state.cartQty=state.cartProduct===state.product?Math.min(9,state.cartQty+state.qty):state.qty;state.cartProduct=state.product;navigate('cart');if(replaced)toast('Carrinho de exemplo atualizado com o produto escolhido.');return;}
 if(['payment','date','time'].includes(a)){state[a]=value;render(true);return;}
 if(a==='toggleReturn'){state.taxiReturn=!state.taxiReturn;render(true);return;}
 if(a==='book'){
  if(state.service==='taxi'&&(!state.taxiFrom.trim()||!state.taxiTo.trim())){toast('Preencha a retirada e o destino.');return;}
  state.booked=true;state.booking={...state,booking:null};navigate('confirmation');return;
 }
 if(a==='editBooking'){if(state.booking){const copy={...state.booking};delete copy.booking;Object.assign(state,copy);}navigate('booking');return;}
 if(a==='login'){
  const email=$('#field-email'),password=$('#field-password');
  if(email.value&&!email.validity.valid){email.reportValidity();return;}
  navigate('home');toast('Bem-vinda! Você está no acesso demonstrativo.');return;
 }
}
document.addEventListener('click',e=>{const target=e.target.closest('[data-action]');if(target)act(target.dataset.action);const route=e.target.closest('[data-route]');if(route)navigate(route.dataset.route);});
document.addEventListener('input',e=>{
 const key=e.target.dataset.field;if(!key||['email','password'].includes(key))return;
 state[key]=e.target.value;
 if(key==='search'){const start=e.target.selectionStart;render(true);const input=$('#field-search');input.focus();input.setSelectionRange(start,start);}
});
document.addEventListener('change',e=>{if(e.target.dataset.field)state[e.target.dataset.field]=e.target.value;});
$('#screen-links').innerHTML=Object.entries(names).map(([id,name])=>`<button data-route="${id}">${name}</button>`).join('');
$('#screen-select').innerHTML=Object.entries(names).map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
$('#screen-select').addEventListener('change',e=>navigate(e.target.value));
$('#device-width').addEventListener('change',e=>{document.documentElement.style.setProperty('--preview-width',e.target.value+'px');$('#size-caption').textContent=e.target.value+' × 932 · largura de referência';});
$('#reset').addEventListener('click',()=>{Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,PZ.initial);navigate('home');toast('Prévia reiniciada.');});
if(names[location.hash.slice(1)])state.route=location.hash.slice(1);
render();
