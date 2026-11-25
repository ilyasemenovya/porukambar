(() => {
'use strict';
const groups=window.BAR_MENU, shared=window.PorukamCart, byId=shared.byId, $=s=>document.querySelector(s);
let cart=shared.read(),active=0;
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=s=>s.toLocaleLowerCase('ru').replace(/ё/g,'е');
function renderMenu(){
 $('#categories').innerHTML=groups.map((g,i)=>`<button data-category="${i}" class="${g.title==='НАСТОЙКИ'||g.title==='ПИВО И СИДР'?'category-highlight':''}" aria-pressed="${i===active}">${esc(g.title)}</button>`).join('');
 const query=normalized($('#search').value.trim());let result='';
 if(active===0&&!query)result='<div class="tincture-banner"><div><h2>Настойки</h2><p>46 вкусов. Выбирайте свой.</p></div><strong>20 мл · 100 ₽<br>40 мл · 190 ₽</strong></div>';
 for(const [gi,g] of groups.entries()){if(!query&&gi!==active)continue;
 for(const s of g.sections){const items=s.items.filter(i=>!query||normalized(i.name+' '+i.description+' '+s.title).includes(query));if(!items.length)continue;
 result+=`<section><div class="section-heading"><h3>${esc(s.title)}</h3><span>${items.length}</span></div><div class="grid">`+items.map(i=>`<article class="drink" data-detail="${esc(i.variants[0].id)}"><h4><button type="button" class="detail-open" aria-haspopup="dialog">${esc(i.name)}</button></h4>${i.description?`<p class="description">${esc(i.description)}</p>`:''}<div class="variants">${i.variants.map(v=>`<button class="variant" data-add="${v.id}" aria-label="Добавить ${esc(i.name)}, ${esc(v.volume)}, ${v.price} рублей"><span>${esc(v.volume)}</span><strong>${money(v.price)}</strong><span class="plus" aria-hidden="true">+</span></button>`).join('')}</div></article>`).join('')+'</div></section>';
 }}$('#menu').innerHTML=result||'<p>Ничего не нашли. Попробуйте другое название.</p>';
}
function totals(){return Object.entries(cart).reduce((a,[id,n])=>({count:a.count+n,sum:a.sum+n*byId.get(id).price}),{count:0,sum:0});}
function update(){const t=totals();$('#basket-count').textContent=t.count;$('#basket-total').textContent=money(t.sum);$('#total').textContent=money(t.sum);$('#show-waiter').disabled=!t.count;$('#clear-cart').hidden=!t.count;}
function renderCart(){
 $('#cart-items').innerHTML=Object.entries(cart).map(([id,n])=>{const i=byId.get(id);return `<article class="cart-row"><div><h3>${esc(i.name)}</h3><p>${esc(i.source)} · ${esc(i.volume)} · ${money(i.price)} за порцию</p></div><div class="quantity"><button data-change="${id}" data-step="-1" aria-label="Убрать одну порцию ${esc(i.name)}, ${esc(i.volume)}">−</button><span>${n} шт.</span><button data-change="${id}" data-step="1" aria-label="Добавить одну порцию ${esc(i.name)}, ${esc(i.volume)}" ${n>=99?'disabled':''}>+</button></div><div class="line-total">${money(i.price*n)}</div></article>`;}).join('')||'<p>Список пока пуст. Добавьте блюда и напитки из меню.</p>';update();
}
$('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;active=Number(b.dataset.category);$('#search').value='';renderMenu();$('.navigation').scrollIntoView({block:'start'});});
$('#search').addEventListener('input',renderMenu);
$('#menu').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;const id=b.dataset.add;cart=shared.change(id,1);update();$('#status').textContent=byId.get(id).name+' добавлено. В списке '+totals().count;});
$('#cart-items').addEventListener('click',e=>{const b=e.target.closest('[data-change]');if(!b)return;const id=b.dataset.change;cart=shared.change(id,Number(b.dataset.step));renderCart();const next=$('#cart-items').querySelector(`[data-change="${id}"][data-step="${b.dataset.step}"]`);(next||$('#close-cart')).focus();});
function mode(waiter){$('#cart').classList.toggle('waiter',waiter);$('#cart-title').textContent=waiter?'Для официанта':'Общая корзина';$('#show-waiter').hidden=waiter;$('#edit-cart').hidden=!waiter;}
$('#basket').addEventListener('click',()=>{mode(false);renderCart();$('#cart').showModal();$('#close-cart').focus();});
$('#close-cart').addEventListener('click',()=>$('#cart').close());
$('#cart').addEventListener('click',e=>{if(e.target!==$('#cart'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
$('#show-waiter').addEventListener('click',()=>{mode(true);$('#cart').scrollTop=0;$('#edit-cart').focus({preventScroll:true});});
$('#edit-cart').addEventListener('click',()=>{mode(false);$('#show-waiter').focus();});
$('#clear-cart').addEventListener('click',()=>{if(confirm('Убрать все блюда и напитки из корзины?')){cart=shared.clear();renderCart();}});
shared.subscribe(saved=>{cart=saved;renderCart();});
renderMenu();update();
})();
