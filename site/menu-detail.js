(() => {
  'use strict';
  const items = new Map(), shared = window.PorukamCart;
  for (const groups of [window.KITCHEN_MENU, window.BAR_MENU]) for (const group of groups || []) for (const section of group.sections) for (const item of section.items) for (const variant of item.variants) items.set(variant.id, item);
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => value.toLocaleString('ru-RU') + ' ₽';
  const dialog = document.createElement('dialog');
  dialog.id = 'item-detail'; dialog.className = 'item-detail'; dialog.setAttribute('aria-labelledby', 'detail-title');
  dialog.innerHTML = '<button type="button" class="close detail-close" aria-label="Закрыть позицию">×</button><div id="detail-content"></div>';
  document.body.append(dialog);
  let current, selected, opener;
  function refresh() {
    const variant = current.variants.find(v => v.id === selected), photo = variant.photo || current.photo;
    const image = dialog.querySelector('.detail-photo');
    image.hidden = !photo; if (photo) image.src = photo; else image.removeAttribute('src');
    dialog.querySelector('#detail-price').textContent = money(variant.price);
    const count = shared.read()[selected] || 0;
    dialog.querySelector('#detail-add').disabled = count >= 99;
    dialog.querySelector('#detail-status').textContent = count ? `В корзине: ${count} шт.` : '';
  }
  function open(id, trigger) {
    current = items.get(id); if (!current) return;
    selected = id; opener = trigger;
    dialog.querySelector('#detail-content').innerHTML = `<img class="detail-photo" alt="${esc(current.name)}"><h2 id="detail-title">${esc(current.name)}</h2>${current.description ? `<p class="detail-description">${esc(current.description)}</p>` : ''}${current.variants.length > 1 ? `<label class="detail-portion">Выберите вариант<select id="detail-variant">${current.variants.map(v => `<option value="${esc(v.id)}" ${v.id === selected ? 'selected' : ''}>${esc(v.volume)} · ${money(v.price)}</option>`).join('')}</select></label>` : `<p>${esc(current.variants[0].volume)}</p>`}<div class="detail-actions"><button id="detail-add" type="button" class="primary">Добавить · <span id="detail-price"></span></button><p id="detail-status" role="status" aria-live="polite"></p></div>`;
    refresh(); dialog.showModal(); dialog.scrollTop = 0; dialog.querySelector('.detail-close').focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const card = event.target.closest('[data-detail]'); if (!card) return;
    if (event.target.closest('button,a,select,label,input') && !event.target.closest('.detail-open')) return;
    const select = card.querySelector('select');
    open(select ? select.value : card.dataset.detail, card.querySelector('.detail-open'));
  });
  dialog.querySelector('.detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    if (event.target.closest('#detail-add')) {
      shared.change(selected, 1); window.dispatchEvent(new Event('porukam-cart-changed')); refresh();
    }
    if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }
  });
  dialog.addEventListener('change', event => { if (event.target.id === 'detail-variant') { selected = event.target.value; refresh(); } });
  shared.subscribe(() => { if (dialog.open) refresh(); });
})();
