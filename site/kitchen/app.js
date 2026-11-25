(() => {
  'use strict';
  const groups = window.KITCHEN_MENU, shared = window.PorukamCart, byId = shared.byId, $ = s => document.querySelector(s);
  let cart = shared.read(), active = 0;
  const money = value => value.toLocaleString('ru-RU') + ' ₽';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalized = value => value.toLocaleLowerCase('ru').replace(/ё/g, 'е');
  function renderMenu() {
    const query = normalized($('#search').value.trim());
    $('#categories').innerHTML = groups.map((group, index) => `<button type="button" data-category="${index}" aria-pressed="${!query && index === active}">${esc(group.title)}</button>`).join('');
    let result = '';
    for (const [gi, group] of groups.entries()) {
      if (!query && gi !== active) continue;
      for (const [si, section] of group.sections.entries()) {
        const items = section.items.filter(item => !query || normalized([item.name, item.description, section.title, ...item.variants.map(v => v.volume)].join(' ')).includes(query));
        if (!items.length) continue;
        result += `<section aria-labelledby="section-${gi}-${si}"><div class="section-heading"><h2 id="section-${gi}-${si}">${esc(section.title)}</h2><span>${items.length}</span></div>${section.photo ? `<img class="section-photo" src="${esc(section.photo)}" alt="${esc(section.title)} — общая подача" width="960" height="640" loading="lazy" decoding="async">` : ''}<div class="grid">`;
        result += items.map(item => {
          const variant = item.variants[0], selectId = 'choice-' + variant.id;
          const choice = item.variants.length > 1 ? `<label class="portion" for="${esc(selectId)}">Выберите вариант<select id="${esc(selectId)}">${item.variants.map(v => `<option value="${esc(v.id)}">${esc(v.volume)} · ${money(v.price)}</option>`).join('')}</select></label>` : `<span class="portion-weight">${esc(variant.volume)}</span>`;
          return `<article class="dish">${item.photo ? `<div class="dish-photo"><img src="${esc(item.photo)}" alt="${esc(item.name)}" loading="lazy" decoding="async" width="960" height="640"></div>` : ''}<h3>${esc(item.name)}</h3>${item.description ? `<p class="description">${esc(item.description)}</p>` : ''}<div class="dish-choice">${choice}<button type="button" class="add-dish" data-add="${esc(variant.id)}" aria-label="Добавить ${esc(item.name)}, ${esc(variant.volume)}, ${variant.price} рублей"><span>Добавить</span><strong>${money(variant.price)}</strong><span class="plus" aria-hidden="true">+</span></button></div></article>`;
        }).join('') + '</div></section>';
      }
    }
    $('#menu').innerHTML = result || '<p class="empty-search" role="status">Ничего не нашли. Попробуйте другое название.</p>';
  }
  function totals() {
    return Object.entries(cart).reduce((total, [id, count]) => ({count:total.count + count, sum:total.sum + count * byId.get(id).price}), {count:0, sum:0});
  }
  function update() {
    const total = totals();
    $('#basket-count').textContent = total.count; $('#basket-total').textContent = money(total.sum); $('#total').textContent = money(total.sum);
    $('#show-waiter').disabled = !total.count; $('#clear-cart').hidden = !total.count;
  }
  function renderCart() {
    $('#cart-items').innerHTML = Object.entries(cart).map(([id, count]) => {
      const item = byId.get(id);
      return `<article class="cart-row"><div><h3>${esc(item.name)}</h3><p>${esc(item.source)} · ${esc(item.volume)} · ${money(item.price)} за порцию</p></div><div class="quantity"><button type="button" data-change="${esc(id)}" data-step="-1" aria-label="Убрать одну порцию ${esc(item.name)}">−</button><span>${count} шт.</span><button type="button" data-change="${esc(id)}" data-step="1" aria-label="Добавить одну порцию ${esc(item.name)}" ${count >= 99 ? 'disabled' : ''}>+</button></div><div class="line-total">${money(item.price * count)}</div></article>`;
    }).join('') || '<p>Список пока пуст. Добавьте блюда и напитки из меню.</p>';
    update();
  }
  $('#categories').addEventListener('click', event => {
    const button = event.target.closest('[data-category]'); if (!button) return;
    active = Number(button.dataset.category); $('#search').value = ''; renderMenu();
    $(`#categories [data-category="${active}"]`).focus({preventScroll:true});
    $('.navigation').scrollIntoView({block:'start'});
  });
  $('#search').addEventListener('input', renderMenu);
  $('#menu').addEventListener('change', event => {
    if (!event.target.matches('select')) return;
    const item = byId.get(event.target.value), button = event.target.closest('.dish').querySelector('[data-add]');
    const image = event.target.closest('.dish').querySelector('.dish-photo img');
    if (image && item.photo) image.src = item.photo;
    button.dataset.add = item.id; button.querySelector('strong').textContent = money(item.price);
    button.setAttribute('aria-label', `Добавить ${item.name}, ${item.volume}, ${item.price} рублей`);
  });
  $('#menu').addEventListener('click', event => {
    const button = event.target.closest('[data-add]'); if (!button) return;
    const id = button.dataset.add; if (!byId.has(id)) return;
    cart = shared.change(id, 1); update();
    $('#status').textContent = 'Добавлено: ' + byId.get(id).name + '. В списке ' + totals().count;
  });
  $('#cart-items').addEventListener('click', event => {
    const button = event.target.closest('[data-change]'); if (!button) return;
    const id = button.dataset.change; cart = shared.change(id, Number(button.dataset.step)); renderCart();
    const next = $('#cart-items').querySelector(`[data-change="${id}"][data-step="${button.dataset.step}"]`);
    (next || $('#close-cart')).focus();
  });
  function mode(waiter) {
    $('#cart').classList.toggle('waiter', waiter); $('#cart-title').textContent = waiter ? 'Для официанта' : 'Общая корзина';
    $('#show-waiter').hidden = waiter; $('#edit-cart').hidden = !waiter;
  }
  $('#basket').addEventListener('click', () => { mode(false); renderCart(); $('#cart').showModal(); $('#close-cart').focus(); });
  $('#close-cart').addEventListener('click', () => $('#cart').close());
  $('#cart').addEventListener('click', event => {
    if (event.target !== $('#cart')) return;
    const rect = event.target.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
  });
  $('#show-waiter').addEventListener('click', () => { mode(true); $('#cart').scrollTop = 0; $('#edit-cart').focus({preventScroll:true}); });
  $('#edit-cart').addEventListener('click', () => { mode(false); $('#show-waiter').focus(); });
  $('#clear-cart').addEventListener('click', () => { if (confirm('Убрать все блюда и напитки из корзины?')) { cart = shared.clear(); renderCart(); } });
  shared.subscribe(saved => { cart = saved; renderCart(); });
  renderMenu(); update();
})();

