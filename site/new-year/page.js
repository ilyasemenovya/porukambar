const dates=[18,19,24,25,26,27];
const dateSelect=document.querySelector('#date');
const grid=document.querySelector('.date-grid');
for(const day of dates){
 const value=`2026-12-${day}`;
 const weekday=new Intl.DateTimeFormat('ru',{weekday:'short',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));
 const button=document.createElement('button');button.type='button';button.dataset.date=value;button.setAttribute('aria-label',`${day} декабря 2026`);button.setAttribute('aria-pressed','false');
 const prime=day===25||day===26;
 const host='Артём Чугунов';
 button.className='event-card';
 button.innerHTML=`<span class="event-date"><strong>${day}</strong><span>декабря · ${weekday}</span></span><span class="event-host">Ведущий<br><b>${host}</b></span><span class="event-dj">DJ Vaisov</span><span class="event-prices"><span><b>от ${prime?'3 800':'3 500'} ₽</b><span>на гостя</span></span></span><span class="event-action">Выбрать дату</span>`;
 button.setAttribute('aria-label',`${day} декабря, ${host}, DJ Vaisov. От ${prime?3800:3500} рублей на гостя. Выбрать дату`);
 grid.append(button);
 dateSelect.add(new Option(`${day} декабря`,value));
 button.addEventListener('click',()=>{dateSelect.value=value;syncDates();document.querySelector('#booking-heading').focus({preventScroll:true});document.querySelector('#request').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
}
dateSelect.add(new Option('Другая дата - обсудим','other'));
function syncDates(){updateBookingPrices();if(dateSelect.value)document.querySelector('.booking-details').open=true;for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.date===dateSelect.value));}
dateSelect.addEventListener('change',syncDates);
for(const link of document.querySelectorAll('[data-hall]'))link.addEventListener('click',()=>{document.querySelector('#hall').value=link.dataset.hall;document.querySelector('.booking-details').open=true;});
document.querySelector('form').addEventListener('submit',event=>event.preventDefault());

const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const snowLayer=document.createElement('div');
snowLayer.className='snowfall';
snowLayer.setAttribute('aria-hidden','true');
for(let i=0;i<36;i++){
 const flake=document.createElement('span');
 flake.className='snowflake';
 flake.style.cssText=`--x:${Math.random()*100}%;--size:${2+Math.random()*3}px;--opacity:${.18+Math.random()*.32};--duration:${12+Math.random()*12}s;--delay:-${Math.random()*24}s;--drift:${Math.random()*90-45}px`;
 snowLayer.append(flake);
}
document.body.append(snowLayer);
const snowToggle=document.querySelector('.snow-toggle');
let snowEnabled=true;
function updateSnow(){
 snowLayer.hidden=!snowEnabled||motionPreference.matches;
 snowLayer.classList.toggle('is-paused',document.hidden||snowLayer.hidden);
 snowToggle.hidden=motionPreference.matches;
 snowToggle.setAttribute('aria-pressed',String(snowEnabled));
 snowToggle.textContent=snowEnabled?'Снег: вкл.':'Снег: выкл.';
}
snowToggle.addEventListener('click',()=>{snowEnabled=!snowEnabled;updateSnow();});
motionPreference.addEventListener('change',updateSnow);
document.addEventListener('visibilitychange',updateSnow);
updateSnow();


const menuCarousel=document.querySelector('.menu-carousel');
const categoryBar=document.querySelector('.menu-categories');
const menuChoice=document.querySelector('#booking-menu');
let activeMenu='3500',activeCategory='cold';
const money=value=>new Intl.NumberFormat('ru-RU').format(value)+' ₽';
function updateBookingPrices(){
 const prime=['2026-12-25','2026-12-26'].includes(dateSelect.value);
 for(const option of document.querySelectorAll('#booking-menu option[value]:not([value=""])'))option.textContent='Меню '+money(Number(option.value)+(prime?300:0));
}
function renderDishes(){
 const group=banquetMenus[activeMenu].find(g=>g.id===activeCategory);
 document.querySelector('#menu-serving').textContent=group.note;
 menuCarousel.innerHTML=group.dishes.map(d=>`<article class="dish-card"><h4>${d.name}</h4><p class="dish-weight">${d.weight}</p><div class="dish-photo-placeholder"><img src="${d.image}" alt="${d.name}" width="1200" height="800" loading="lazy" decoding="async"></div></article>`).join('');
 for(const button of categoryBar.children)button.setAttribute('aria-pressed',String(button.dataset.category===activeCategory));
 menuCarousel.scrollLeft=0;
 alignDishCards();
}
function renderMenu(){
 const groups=banquetMenus[activeMenu];
 if(!groups.some(g=>g.id===activeCategory))activeCategory='cold';
 categoryBar.innerHTML=groups.map(g=>`<button type="button" data-category="${g.id}" aria-pressed="${g.id===activeCategory}">${g.label}</button>`).join('');
 document.querySelector('#menu-rate').textContent='На гостя · 25 и 26 декабря - '+money(Number(activeMenu)+300);
 const pdf=document.querySelector('#menu-pdf');pdf.href=`assets/menu-${activeMenu}.pdf`;pdf.textContent='Скачать меню '+money(Number(activeMenu))+' · PDF';
 for(const button of document.querySelectorAll('[data-menu]'))button.setAttribute('aria-pressed',String(button.dataset.menu===activeMenu));
 renderDishes();
}
for(const button of document.querySelectorAll('[data-menu]'))button.addEventListener('click',()=>{activeMenu=button.dataset.menu;menuChoice.value=activeMenu;renderMenu();});
categoryBar.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderDishes();});
menuChoice.addEventListener('change',()=>{if(menuChoice.value){activeMenu=menuChoice.value;renderMenu();}});
for(const control of document.querySelectorAll('[data-slide]'))control.addEventListener('click',()=>menuCarousel.scrollBy({left:Number(control.dataset.slide)*(menuCarousel.querySelector('.dish-card').getBoundingClientRect().width+18),behavior:motionPreference.matches?'instant':'smooth'}));
function alignDishCards(){
 menuCarousel.style.removeProperty('--dish-title-height');
 const titles=[...menuCarousel.querySelectorAll('h4')];
 if(titles.length)menuCarousel.style.setProperty('--dish-title-height',Math.ceil(Math.max(...titles.map(t=>t.getBoundingClientRect().height)))+'px');
}
let dishResizeFrame;
window.addEventListener('resize',()=>{cancelAnimationFrame(dishResizeFrame);dishResizeFrame=requestAnimationFrame(alignDishCards);});
renderMenu();updateBookingPrices();
if(document.fonts)document.fonts.ready.then(alignDishCards);
