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
  let current, selected, opener, photoIndex = 0;
  function refresh() {
    const variant = current.variants.find(v => v.id === selected);
    const photos = variant.photos || (variant.photo ? [variant.photo] : current.photos || (current.photo ? [current.photo] : []));
    photoIndex = Math.min(photoIndex, Math.max(0, photos.length - 1));
    const photo = photos[photoIndex];
    const thumbs = dialog.querySelector('.detail-thumbs');
    thumbs.hidden = photos.length < 2;
    thumbs.innerHTML = photos.length > 1 ? photos.map((src, i) => `<button type="button" data-photo-index="${i}" aria-label="Фото ${i + 1}" aria-pressed="${i === photoIndex}"><img src="${esc(src)}" alt="" width="90" height="60"></button>`).join('') : '';
    const image = dialog.querySelector('.detail-photo');
    image.hidden = !photo; if (photo) image.src = photo; else image.removeAttribute('src');
    dialog.querySelector('#detail-price').textContent = money(variant.price);
    const count = shared.read()[selected] || 0;
    dialog.querySelector('#detail-add').disabled = count >= 99;
    dialog.querySelector('#detail-status').textContent = count ? `В корзине: ${count} шт.` : '';
  }
  function open(id, trigger) {
    current = items.get(id); if (!current) return;
    selected = id; opener = trigger; photoIndex = 0;
    dialog.querySelector('#detail-content').innerHTML = `<img class="detail-photo" alt="${esc(current.name)}"><div class="detail-thumbs" aria-label="Фотографии блюда"></div><h2 id="detail-title">${esc(current.name)}</h2>${current.description ? `<p class="detail-description">${esc(current.description)}</p>` : ''}${current.variants.length > 1 ? `<label class="detail-portion">Выберите вариант<select id="detail-variant">${current.variants.map(v => `<option value="${esc(v.id)}" ${v.id === selected ? 'selected' : ''}>${esc(v.volume)} · ${money(v.price)}</option>`).join('')}</select></label>` : `<p>${esc(current.variants[0].volume)}</p>`}<div class="detail-actions"><button id="detail-add" type="button" class="primary">Добавить · <span id="detail-price"></span></button><p id="detail-status" role="status" aria-live="polite"></p></div>`;
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
    const thumb = event.target.closest('[data-photo-index]');
    if (thumb) { photoIndex = Number(thumb.dataset.photoIndex); refresh(); dialog.querySelector(`[data-photo-index="${photoIndex}"]`).focus({preventScroll:true}); }
    if (event.target.closest('#detail-add')) {
      shared.change(selected, 1); window.dispatchEvent(new Event('porukam-cart-changed')); refresh();
    }
    if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }
  });
  dialog.addEventListener('change', event => { if (event.target.id === 'detail-variant') { selected = event.target.value; photoIndex = 0; refresh(); } });
  shared.subscribe(() => { if (dialog.open) refresh(); });
})();
