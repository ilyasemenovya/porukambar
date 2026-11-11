const navigation = document.querySelector('#site-nav');
const navToggle = document.querySelector('.nav-toggle');
function closeNavigation() {
  navigation?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Открыть навигацию');
}
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navigation?.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Закрыть навигацию' : 'Открыть навигацию');
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNavigation(); });
const bookingDialog = document.querySelector('#booking-dialog');
const bookingTitle = document.querySelector('#booking-title');
const bookingDescription = document.querySelector('#booking-description');
const bookingCopy = {
 'main-table': ['Стол в основном зале', 'Сообщите дату, время и количество гостей. Менеджер уточнит условия бронирования столика и подтвердит наличие мест.'],
 'main-hall': ['Аренда основного зала', 'Сообщите дату, формат мероприятия и количество гостей. Обсудим аренду всего зала, меню и оборудование для вашей программы.'],
 'karaoke-hall': ['Аренда караоке-зала', 'Сообщите дату и количество гостей. Менеджер подтвердит доступность зала, время аренды, депозит и работу звукорежиссёра.'],
 room: ['Бронирование банкетной комнаты', 'Сообщите дату, время и количество гостей — до 25 человек. Менеджер подтвердит доступность комнаты и условия: депозит 20 000 ₽ с воскресенья по четверг или 40 000 ₽ в пятницу и субботу, 5 часов аренды.'],
 hitoboi: ['Хитобои · 20 ноября', 'Начало в 19:00. Ведущий Артём Чугунов и DJ-сет. Сообщите, что хотите забронировать стол на 20 ноября, и количество гостей. Менеджер подтвердит наличие мест.'],
 weekend: ['Weekend · 21 ноября', 'Начало в 19:00. Ведущий Артём Чугунов и DJ-сет. Сообщите, что хотите забронировать стол на 21 ноября, и количество гостей. Менеджер подтвердит наличие мест.'],
 table: ['Бронирование столика', 'Сообщите дату, время и количество гостей. Менеджер проверит наличие мест и подтвердит бронь.'],
 karaoke: ['Столик в караоке-зале', 'Уточните программу на выбранную дату, время начала и наличие столов. Менеджер поможет спланировать вечер.'],
 event: ['Бронирование мероприятия', 'Сообщите дату, повод, примерное количество гостей и желаемую зону. Обсудим размещение, меню и условия мероприятия.'],
 delivery: ['Доставка', 'Доставка пока не запущена. Команда подскажет доступные варианты заказа с собой.'],
 pickup: ['Заказ с собой', 'Уточните доступные блюда, возможность самовывоза и удобное время. Сотрудник подтвердит сумму и готовность заказа. Адрес самовывоза: Льва Толстого, 3, 3 этаж.']
};
document.querySelectorAll('[data-booking]').forEach(link => link.addEventListener('click', event => {
 if (!bookingDialog || typeof bookingDialog.showModal !== 'function') return;
 event.preventDefault();
 const [title, description] = bookingCopy[link.dataset.booking] || bookingCopy.table;
 bookingTitle.textContent = title; bookingDescription.textContent = description;
 const isOrder = ['delivery', 'pickup'].includes(link.dataset.booking);
 bookingDialog.querySelector('.eyebrow').textContent = isOrder ? '«По рукам» / Заказ с собой' : '«По рукам» / Бронирование';
 bookingDialog.querySelector('.dialog-note').textContent = isOrder ? 'Заказ принят только после подтверждения сотрудником.' : 'Бронь действует после подтверждения менеджером.';
 closeNavigation(); bookingDialog.showModal(); document.body.classList.add('modal-open');
}));
bookingDialog?.querySelector('.dialog-close')?.addEventListener('click', () => bookingDialog.close());
bookingDialog?.addEventListener('close', () => document.body.classList.remove('modal-open'));
bookingDialog?.addEventListener('click', event => {
 if (event.target !== bookingDialog) return;
 const b = bookingDialog.getBoundingClientRect();
 if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) bookingDialog.close();
});
const menuSections = document.querySelectorAll('.menu-panel');
function showMenu() {
 if (!menuSections.length) return;
 const active = window.location.hash === '#bar' ? 'bar' : 'kitchen';
 menuSections.forEach(section => { section.hidden = section.id !== active; });
 document.querySelectorAll('[data-menu-tab]').forEach(link => link.setAttribute('aria-current', String(link.dataset.menuTab === active)));
}
window.addEventListener('hashchange', showMenu); showMenu();

const photoDialog = document.querySelector('#photo-dialog');
const photos = [...document.querySelectorAll('[data-gallery]')];
let activePhoto = 0;
function showPhoto(index) {
 if (!photoDialog || !photos.length) return;
 activePhoto = (index + photos.length) % photos.length;
 const link = photos[activePhoto];
 const image = photoDialog.querySelector('#photo-image');
 image.src = link.href;
 image.alt = link.querySelector('img').alt;
 photoDialog.querySelector('#photo-caption').textContent = link.dataset.caption;
 photoDialog.querySelector('#photo-counter').textContent = `${activePhoto + 1} / ${photos.length}`;
}
photos.forEach((link, index) => link.addEventListener('click', event => {
 if (!photoDialog || typeof photoDialog.showModal !== 'function') return;
 event.preventDefault();
 showPhoto(index);
 photoDialog.showModal();
 document.body.classList.add('modal-open');
}));
photoDialog?.querySelector('.dialog-close')?.addEventListener('click', () => photoDialog.close());
photoDialog?.addEventListener('close', () => document.body.classList.remove('modal-open'));
photoDialog?.querySelector('#photo-prev')?.addEventListener('click', () => showPhoto(activePhoto - 1));
photoDialog?.querySelector('#photo-next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
photoDialog?.addEventListener('keydown', event => {
 if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
  event.preventDefault();
  showPhoto(activePhoto + (event.key === 'ArrowLeft' ? -1 : 1));
 }
});
photoDialog?.addEventListener('click', event => {
 if (event.target !== photoDialog) return;
 const bounds = photoDialog.getBoundingClientRect();
 if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
});
