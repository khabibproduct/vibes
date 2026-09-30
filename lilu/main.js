// LILU Drinks — меню на главной странице.
// Меню, цены, фото и контакты берутся из menu-data.js, который создаёт скрипт scripts/sync_oson24.py
// по странице бара на Oson24. Чтобы обновить сайт, запустите скрипт заново.

const CURRENCY = 'сом.';   // сомони
const menu = window.MENU;

const $ = sel => document.querySelector(sel);
const esc = str => String(str).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const money = n => `${n.toLocaleString('ru-RU')} ${CURRENCY}`;
const hasCyrillic = str => /[а-яё]/i.test(str);

// «FREAKSHAKES» -> «Freakshakes», «BUBBLE TEA Ice Cream» -> «Bubble Tea Ice Cream»
const titleCase = str => str.replace(/[A-Za-z]{3,}/g, w => (w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w));

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, '');
  return d.length === 12 ? `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}` : raw;
}

const allItems = () => menu.categories.flatMap(c => c.items);

/* ---------- Hero ---------- */
function renderHero() {
  const byId = new Map(allItems().map(i => [i.id, i]));
  // голубая лагуна, freakshake Lilush, манго карамель бабл чай
  const picks = [4697, 4739, 4711].map(id => byId.get(id)).filter(Boolean);
  $('#heroCups').innerHTML = picks.map(d =>
    `<img class="hero-photo" src="${d.img}" alt="${esc(d.name)}" width="480" height="480" decoding="async">`
  ).join('');
}

/* ---------- Marquee ---------- */
function renderMarquee() {
  const words = menu.categories.map(c => titleCase(c.en));
  const row = words.map(w => `<span class="marquee-item">${esc(w)}<span class="pearl"></span></span>`).join('');
  $('#marquee').innerHTML = row + row;
}

/* ---------- Texts that depend on the menu ---------- */
function renderTexts() {
  const cats = menu.categories.length;
  const count = allItems().length;
  const info = menu.info;

  $('#menuLead').textContent =
    `${cats} ${plural(cats, 'категория', 'категории', 'категорий')} и ${count} ${plural(count, 'позиция', 'позиции', 'позиций')}. ` +
    `Названия и цены те же, что на Oson24. Обновлено ${formatDate(menu.updated)}.`;
  $('#factCount').textContent = count;
  $('#factCountLabel').textContent = `${plural(count, 'позиция', 'позиции', 'позиций')} в ${cats} ${plural(cats, 'категории', 'категориях', 'категориях')}`;

  const sentences = [];
  if (info.deliveryFrom && info.deliveryTo) sentences.push(`Привезём за ${info.deliveryFrom}–${info.deliveryTo} минут.`);
  const terms = [];
  if (info.deliveryPrice != null) terms.push(`доставка ${money(info.deliveryPrice)}`);
  if (info.minOrder) terms.push(`минимальный заказ ${money(info.minOrder)}`);
  if (terms.length) sentences.push(terms.join(', ').replace(/^./, ch => ch.toUpperCase()) + (terms[terms.length - 1].endsWith('.') ? '' : '.'));
  if (info.cashOnly) sentences.push('Оплата наличными.');
  $('#orderInfo').textContent = `Мы есть на Oson24. Выберите напитки на странице нашего бара и оформите заказ там. ${sentences.join(' ')}`.trim();

  if (info.open && info.close) $('#visitHours').innerHTML = `Ежедневно<br>${info.open}–${info.close}`;
  if (info.phone) {
    const phone = $('#visitPhone');
    phone.textContent = formatPhone(info.phone);
    phone.href = `tel:${info.phone}`;
  }
  if (info.lat && info.lng) $('#visitMap').href = `https://www.google.com/maps?q=${info.lat},${info.lng}`;
}

/* ---------- Menu ---------- */
function drinkCard(d) {
  const sizes = d.sizes.map(s => `
    <li>
      <span class="size">${esc(s.label)}</span>
      <span class="price">${money(s.price)}</span>
    </li>`).join('');
  return `
    <article class="drink glass">
      <div class="drink-visual">
        <img src="${d.img}" alt="${esc(d.name)}" width="480" height="480" loading="lazy" decoding="async">
      </div>
      <div class="drink-body">
        <h4 class="drink-name${hasCyrillic(d.name) ? ' is-ru' : ''}">${esc(d.name)}</h4>
        <ul class="sizes">${sizes}</ul>
      </div>
    </article>`;
}

function renderMenu() {
  $('#chips').innerHTML = menu.categories.map(cat =>
    `<a class="chip" href="#cat-${cat.id}" data-cat="${cat.id}">${esc(cat.ru)} <small>${cat.items.length}</small></a>`
  ).join('');

  $('#menuGroups').innerHTML = menu.categories.map(cat => `
    <section class="group" id="cat-${cat.id}" aria-labelledby="t-${cat.id}">
      <div class="group-head">
        <div>
          <h3 class="group-title" id="t-${cat.id}">${esc(titleCase(cat.en))}</h3>
          <p class="group-ru">${esc(cat.ru)}</p>
        </div>
        <p class="group-meta">${cat.items.length} ${plural(cat.items.length, 'позиция', 'позиции', 'позиций')}</p>
      </div>
      <div class="drinks">${cat.items.map(drinkCard).join('')}</div>
    </section>`).join('');

  // sliding glass indicator under the chip of the category in view
  const bar = $('#chips');
  const chips = [...bar.querySelectorAll('.chip')];
  const indicator = document.createElement('span');
  indicator.className = 'chip-indicator';
  bar.prepend(indicator);
  const setActive = id => {
    chips.forEach(c => {
      const on = c.dataset.cat === id;
      c.classList.toggle('is-active', on);
      if (!on) return;
      indicator.style.width = `${c.offsetWidth}px`;
      indicator.style.transform = `translateX(${c.offsetLeft}px)`;
      const left = c.offsetLeft - (bar.clientWidth - c.offsetWidth) / 2;
      bar.scrollTo({ left, behavior: 'smooth' });
    });
  };
  setActive(String(menu.categories[0].id));
  window.addEventListener('resize', () => setActive(bar.querySelector('.chip.is-active').dataset.cat));
  if (document.fonts) document.fonts.ready.then(() => setActive(bar.querySelector('.chip.is-active').dataset.cat));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id.replace('cat-', '')); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.group').forEach(g => io.observe(g));
  }
}

if (menu && menu.categories) {
  renderHero();
  renderMarquee();
  renderTexts();
  renderMenu();
}
