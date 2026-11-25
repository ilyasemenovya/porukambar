(() => {
  'use strict';
  const key = 'porukam-menu-cart-v1', legacy = ['porukam-kitchen-cart-v1', 'porukam-bar-cart-v1'];
  const byId = new Map();
  for (const [groups, source] of [[window.KITCHEN_MENU, 'Кухня'], [window.BAR_MENU, 'Бар']]) {
    for (const group of groups || []) for (const section of group.sections) for (const item of section.items) {
      for (const variant of item.variants) byId.set(variant.id, {...variant, name:item.name, photo:variant.photo || item.photo, source});
    }
  }
  const clean = value => {
    const result = {};
    if (value && typeof value === 'object' && !Array.isArray(value)) for (const [id, n] of Object.entries(value)) {
      if (byId.has(id) && Number.isInteger(n) && n > 0 && n <= 99) result[id] = n;
    }
    return result;
  };
  let memory = {};
  const parse = value => { try { return clean(JSON.parse(value)); } catch { return {}; } };
  function read() {
    try { const raw = localStorage.getItem(key); if (raw !== null) memory = parse(raw); } catch {}
    return {...memory};
  }
  function save(cart) {
    memory = clean(cart);
    try { localStorage.setItem(key, JSON.stringify(memory)); } catch {}
    return {...memory};
  }
  try {
    if (localStorage.getItem(key) === null) {
      for (const oldKey of legacy) Object.assign(memory, parse(localStorage.getItem(oldKey)));
      localStorage.setItem(key, JSON.stringify(memory));
      for (const oldKey of legacy) localStorage.removeItem(oldKey);
    }
  } catch {}
  window.PorukamCart = {
    byId, read,
    change(id, step) {
      const cart = read();
      if (!byId.has(id) || ![1, -1].includes(step)) return cart;
      const n = Math.max(0, Math.min(99, (cart[id] || 0) + step));
      if (n) cart[id] = n; else delete cart[id];
      return save(cart);
    },
    clear: () => save({}),
    subscribe(fn) {
      window.addEventListener('porukam-cart-changed', () => fn(read()));
      window.addEventListener('storage', event => { if (event.key === key || event.key === null) { if (event.newValue === null) memory = {}; fn(read()); } });
      window.addEventListener('pageshow', () => fn(read()));
    }
  };
})();
