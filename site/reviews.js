(() => {
  'use strict';
  // Keep unconfigured integration visibly unavailable; never report a fake submission.
  const config = {endpoint: 'https://api.munlaunge.ru/chat/feedback', yandexUrl: 'https://yandex.ru/maps/org/mun_launzh_bar/45098583680/reviews/', privateMaxRating: 3};
  const $ = id => document.getElementById(id);
  const dialog = $('review-dialog'); if (!dialog) return;
  const ratings = [...dialog.querySelectorAll('[name="review-rating"]')];
  const form = $('review-form'), positive = $('review-positive'), success = $('review-success'), button = $('review-submit'), status = $('review-send-status');
  let rating = 0, pending = null, sending = false, mode = 'review', recipient = '';
  const step = $('review-rating-step'), back = $('review-change-rating');
  function showStep() {step.hidden = false; back.hidden = true; form.hidden = positive.hidden = success.hidden = true; $('review-title').textContent = 'Как прошёл вечер?'; dialog.scrollTop = 0;}
  function openReview() {if (sending) return; $('review-consent').checked = false; mode = 'review'; recipient = ''; $('review-message').placeholder = 'Что нам стоит исправить?'; $('review-recipient').hidden = true; $('review-submit').textContent = 'Отправить команде'; showStep(); dialog.showModal();}
  back.addEventListener('click', () => {if (!sending) {showStep(); const checked=ratings.find(i=>i.checked); if(checked) checked.focus();}});
  document.addEventListener('porukam:boss-message', event => {
    if (sending) return;
    if (!['Илья Андреевич','Дарья Сергеевна'].includes(event.detail?.recipient)) return;
    $('review-consent').checked = false; mode = 'boss'; $('review-message').placeholder = 'Ваш вопрос, предложение или впечатления'; recipient = event.detail.recipient; pending = null;
    $('review-title').textContent = 'Написать боссу';
    $('review-recipient').textContent = 'Кому: ' + recipient; $('review-recipient').hidden = false;
    step.hidden = back.hidden = positive.hidden = success.hidden = true; form.hidden = false;
    $('review-form-title').textContent = 'Что хотите рассказать?'; $('review-submit').textContent = 'Отправить боссу'; status.textContent = '';
    dialog.showModal(); dialog.scrollTop = 0; $('review-message').focus({preventScroll:true});
  });
  if (config.yandexUrl) { $('review-yandex').href = config.yandexUrl; $('review-yandex').hidden = false; $('review-yandex-pending').hidden = true; }
  $('review-trigger').addEventListener('click', openReview);
  dialog.querySelector('.review-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if (event.target === dialog) {const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();}});
  function select(value) {
    rating = value; ratings.forEach(input => input.closest('label').classList.toggle('is-selected', Number(input.value) <= rating));
    $('review-rating-note').textContent = `${rating} из 5 · ${['','Очень плохо','Плохо','Есть что улучшить','Хорошо','Отлично'][rating]}`;
    form.hidden = rating > config.privateMaxRating; positive.hidden = rating <= config.privateMaxRating; success.hidden = true;
    status.textContent = ''; pending = null; $('review-form-title').textContent = 'Расскажите, что пошло не так';
    step.hidden = true; back.hidden = false; $('review-title').textContent = rating <= config.privateMaxRating ? 'Помогите нам стать лучше' : 'Спасибо за оценку!';
    back.textContent = '← Изменить оценку · ' + rating + ' из 5'; dialog.scrollTop = 0;
    if (!form.hidden) $('review-message').focus({preventScroll:true}); else $('review-yandex').focus({preventScroll:true});
  }
  ratings.forEach(input => {input.addEventListener('change', () => select(Number(input.value))); input.addEventListener('click', () => {if (!step.hidden) select(Number(input.value));});});
  $('review-private').addEventListener('click', () => {positive.hidden = true; form.hidden = false; $('review-form-title').textContent = 'Что хотите рассказать команде?'; $('review-message').focus();});
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (sending || (mode === 'review' && !rating) || !form.reportValidity()) return;
    if (!config.endpoint) {status.textContent = 'Отправка ещё настраивается. Сообщение пока не отправлено.'; return;}
    const fields = Object.fromEntries(new FormData(form)); fields.message = fields.message.trim();
    if (!fields.message) {$('review-message').setCustomValidity('Напишите, что произошло.'); $('review-message').reportValidity(); return;}
    const payload = {rating:mode === 'boss' ? null : rating, kind:mode, recipient:mode === 'boss' ? recipient : '', ...fields}; const key = JSON.stringify(payload);
    if (!pending || pending.key !== key) pending = {key, request_id:crypto.randomUUID()};
    sending = true; button.disabled = true; back.disabled = true; ratings.forEach(input => input.disabled = true); status.textContent = 'Отправляем…';
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(config.endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, credentials:'omit', signal:controller.signal, body:JSON.stringify({...payload,request_id:pending.request_id})});
      const result = await response.json(); if (!response.ok || result.ok !== true) throw new Error(result.error || 'Не удалось отправить. Попробуйте ещё раз.');
      form.hidden = true; positive.hidden = true; success.hidden = false; back.hidden = true; form.reset(); pending = null; status.textContent = '';
    } catch (error) {status.textContent = error.name === 'AbortError' || error instanceof TypeError ? 'Не удалось получить подтверждение отправки. Попробуйте ещё раз — повтор не создаст дубликат.' : error.message;}
    finally {clearTimeout(timer); sending = false; button.disabled = false; back.disabled = false; ratings.forEach(input => input.disabled = false);}
  });
  $('review-message').addEventListener('input', () => $('review-message').setCustomValidity(''));
})();
