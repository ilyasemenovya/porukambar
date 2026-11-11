(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = $('guest-chat'); if (!root) return;
  const API = 'https://api.munlaunge.ru/chat';
  const login = $('chat-login'), logout = $('chat-logout'), input = $('chat-text'), send = $('chat-send'), log = $('chat-messages');
  let token = '', user = null, challenge = null, preparedAt = 0, preparing = false, sending = false, fetching = false, visible = false, signature = '', pending = null;
  try { token = sessionStorage.getItem('porukam-chat-session') || ''; } catch (_) {}
  const status = message => { $('chat-status').textContent = message; };
  const reportDialog = document.createElement('dialog');
  reportDialog.className = 'chat-report-dialog';
  reportDialog.setAttribute('aria-labelledby', 'chat-report-title');
  reportDialog.innerHTML = `<form><h3 id="chat-report-title">Пожаловаться на сообщение</h3><label for="chat-report-reason">Что случилось?</label><select id="chat-report-reason" required><option value="">Выберите причину</option value="abuse">Мат и оскорбления</option><option value="spam">Спам и реклама</option><option value="threats">Угрозы</option><option value="other">Другое</option></select><p class="chat-report-status" role="status"></p><div class="chat-report-actions"><button type="button" class="chat-report-cancel">Отмена</button><button type="submit">Отправить жалобу</button></div></form>`;
  document.body.append(reportDialog);
  let reportTarget = null;
  const reportForm = reportDialog.querySelector('form'), reportReason = reportDialog.querySelector('select'), reportStatus = reportDialog.querySelector('[role="status"]'), reportSubmit = reportDialog.querySelector('[type="submit"]');
  reportDialog.querySelector('.chat-report-cancel').addEventListener('click', () => reportDialog.close());
  reportForm.addEventListener('submit', async event => {
    event.preventDefault(); if (reportSubmit.disabled || !reportTarget || !reportForm.reportValidity()) return;
    reportSubmit.disabled = true; reportStatus.textContent = 'Отправляем…';
    try { await api('/report', {id:reportTarget, reason:reportReason.value}); reportDialog.close(); status('Жалоба принята и передана модератору.'); }
    catch (e) {reportStatus.textContent = e.message;}
    finally {reportSubmit.disabled = false;}
  });
  function openReport(id) { if (reportSubmit.disabled) return; reportTarget = id; reportForm.reset(); reportStatus.textContent = ''; reportDialog.showModal(); reportReason.focus(); }
  function saveToken(value) { token = value; try { value ? sessionStorage.setItem('porukam-chat-session', value) : sessionStorage.removeItem('porukam-chat-session'); } catch (_) {} }
  function identity() {
    login.hidden = !!user; logout.hidden = !user; input.disabled = !user;
    $('chat-user').textContent = user ? `Вы — ${user.name}` : 'Ваше имя из Telegram будет видно участникам чата.';
    input.placeholder = user ? 'Что нового? Кто сегодня в баре?' : 'Войдите через Telegram, чтобы написать';
    send.disabled = !user || sending || !input.value.trim();
  }
  async function api(path, data, authenticated = true) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 18000);
    try {
      const headers = {}; if (data !== undefined) headers['Content-Type'] = 'application/json';
      if (authenticated && token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(API + path, {method: data === undefined ? 'GET' : 'POST', headers, body: data === undefined ? undefined : JSON.stringify(data), signal: controller.signal, credentials: 'omit', cache: 'no-store'});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { if (response.status === 401 && authenticated) {saveToken(''); user = null; identity();} throw new Error(result.error || 'Чат временно недоступен. Попробуйте ещё раз.'); }
      return result;
    } catch (error) { if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Нет связи с чатом. Проверьте интернет и попробуйте ещё раз.'); throw error; }
    finally {clearTimeout(timer);}
  }
  function render(messages) {
    const next = JSON.stringify([messages, !!user, !!user?.moderator]); if (next === signature) return;
    const bottom = log.scrollHeight - log.scrollTop - log.clientHeight < 70 || !signature;
    const fragment = document.createDocumentFragment();
    if (!messages.length) { const p = document.createElement('p'); p.className = 'chat-empty'; p.textContent = 'Пока тихо. Поздоровайтесь первым 👋'; fragment.append(p); }
    for (const m of messages) {
      const article = document.createElement('article'); article.className = 'chat-message' + (m.own ? ' is-own' : '');
      const header = document.createElement('header'), name = document.createElement('strong'), time = document.createElement('time'), body = document.createElement('p');
      name.textContent = m.name; const date = new Date(m.created * 1000); time.dateTime = date.toISOString(); time.textContent = date.toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}); body.textContent = m.body;
      header.append(name, time); article.append(header, body);
      if (user) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'chat-message-action';
        const action = m.own || user.moderator ? 'delete' : 'report'; button.textContent = action === 'delete' ? 'Удалить' : 'Пожаловаться';
        button.addEventListener('click', async () => { if (action === 'report') {openReport(m.id); return;} button.disabled = true; try { await api('/delete', {id:m.id}); status('Сообщение удалено.'); await refresh(); } catch (e) {status(e.message); button.disabled = false;} });
        article.append(button);
      }
      fragment.append(article);
    }
    log.replaceChildren(fragment); signature = next; if (bottom) log.scrollTop = log.scrollHeight;
  }
  async function refresh() {
    if (fetching) return; fetching = true;
    try { const result = await api('/messages'); render(result.messages); }
    catch (e) { status(e.message); if (!signature) log.textContent = 'Сообщения пока не удалось загрузить. Повторим попытку автоматически.'; }
    finally { fetching = false; }
  }
  async function completeLogin(result) {
    const current = challenge; challenge = null;
    if (result?.error || !result?.id_token) { status('Вход не завершён. Можно попробовать ещё раз.'); return; }
    if (!current) {status('Начните вход ещё раз.'); return;}
    login.disabled = true; status('Подтверждаем вход…');
    try { const data = await api('/login', {...current, id_token:result.id_token}, false); saveToken(data.token); user = data; identity(); status('Вы вошли. Можно общаться!'); await refresh(); input.focus(); }
    catch (e) {status(e.message);}
    finally {login.disabled = false;}
  }
  async function prepare() {
    if (preparing || user) return; preparing = true; login.disabled = true;
    try {
      if (!window.Telegram?.Login) throw new Error('Telegram не загрузился. Обновите страницу или проверьте подключение.');
      const data = await api('/challenge', {}, false); challenge = {nonce:data.nonce, proof:data.proof}; preparedAt = Date.now();
      window.Telegram.Login.init({client_id:Number(data.client_id), scope:['profile'], lang:'ru', nonce:data.nonce}, completeLogin);
    } catch (e) {status(e.message); challenge = null;}
    finally {preparing = false; login.disabled = false;}
  }
  login.addEventListener('click', async () => {
    if (!challenge || Date.now()-preparedAt > 540000) { await prepare(); if (challenge) status('Всё готово. Нажмите «Войти через Telegram» ещё раз.'); return; }
    status('Подтвердите вход в окне Telegram.');
    try {window.Telegram.Login.open();} catch (_) {status('Не удалось открыть Telegram. Разрешите всплывающее окно и повторите вход.');}
  });
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    try {await api('/logout', {}); saveToken(''); user = null; identity(); status('Вы вышли из чата.'); await refresh(); challenge = null; await prepare();}
    catch (e) {status(e.message);}
    finally {logout.disabled = false;}
  });
  input.addEventListener('input', () => { $('chat-counter').textContent = `${Array.from(input.value).length} / 400`; identity(); });
  $('chat-form').addEventListener('submit', async event => {
    event.preventDefault(); const body = input.value.trim(); if (!user || sending || !body) return;
    if (!pending || pending.body !== body) pending = {body, request_id:crypto.randomUUID()};
    const request = pending; sending = true; identity(); status('Отправляем…');
    try { await api('/messages', request); if (input.value.trim() === body) input.value = ''; pending = null; $('chat-counter').textContent = `${Array.from(input.value).length} / 400`; status(''); await refresh(); log.scrollTop = log.scrollHeight; }
    catch (e) {status(e.message);}
    finally {sending = false; identity();}
  });
  identity();
  async function start() { if (token) {try {user = await api('/me'); identity();} catch (e) {status(e.message);}} await refresh(); if (!user) await prepare(); }
  let started = false;
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting; if (visible && !started) {started = true; start();}}, {rootMargin:'200px'}).observe(root);
  setInterval(() => {if (visible && !document.hidden) refresh();}, 6000);
})();
