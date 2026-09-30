// LILU Drinks — меню, SVG-стаканы и конструктор бабл ти.
// Цены, объёмы и составы — редактируйте в CATEGORIES и BUILDER ниже.

const CURRENCY = '₽';

const CATEGORIES = [
  {
    id: 'lemonade',
    name: 'LILU Lemonade',
    ru: 'Крафтовые домашние лимонады',
    text: 'Сиропы варим сами из свежих фруктов, ягод и трав. Газированная вода, много льда.',
    meta: 'M 500 мл · L 700 мл',
    items: [
      { name: 'Classic Lemon', desc: 'Лимон, свежая мята, тростниковый сахар', vol: '500 мл', price: 290, c: '#F7E57E', ice: 3, mint: true, slice: '#F7E03C', tag: 'Хит' },
      { name: 'Berry Basil', desc: 'Клубника, малина, зелёный базилик', vol: '500 мл', price: 320, c: '#E8436B', c2: '#B8174A', ice: 3, slice: '#FF6F8E' },
      { name: 'Tarragon', desc: 'Домашний тархун, лайм, немного мёда', vol: '500 мл', price: 310, c: '#8CDB5E', ice: 3, mint: true, slice: '#B8E35A' },
      { name: 'Cucumber Lime', desc: 'Огурец, лайм, мята, тоник', vol: '500 мл', price: 300, c: '#C8EFA0', ice: 4, mint: true, slice: '#9BD84A' },
      { name: 'Grapefruit Rosemary', desc: 'Розовый грейпфрут, розмарин, апельсин', vol: '500 мл', price: 320, c: '#FF9377', c2: '#F2586B', ice: 3, slice: '#FF7A6B' },
      { name: 'Sea Buckthorn', desc: 'Облепиха, апельсин, мёд, корица', vol: '500 мл', price: 320, c: '#FFB21F', c2: '#F58A07', ice: 2, slice: '#FFA21F', tag: 'Новинка' },
    ],
  },
  {
    id: 'bar',
    name: 'LILU Bar',
    ru: 'Безалкогольные коктейли',
    text: 'Классика барной карты без алкоголя: мохито, пина колада, май тай и другие.',
    meta: '400 мл',
    items: [
      { name: 'Virgin Mojito', desc: 'Лайм, мята, тростниковый сахар, содовая', vol: '400 мл', price: 350, c: '#DDF7B8', ice: 4, mint: true, slice: '#9BD84A', tag: 'Хит' },
      { name: 'Piña Colada', desc: 'Ананас, кокосовые сливки, сок лайма', vol: '400 мл', price: 380, c: '#FFF1C4', c2: '#FFE08A', ice: 2, slice: '#FFD43B' },
      { name: 'Mai Tai', desc: 'Ананас, апельсин, лайм, миндальный оршад, гренадин', vol: '400 мл', price: 380, c: '#FFC04D', c2: '#E4572E', ice: 3, slice: '#FFA21F' },
      { name: 'Blue Lagoon', desc: 'Блю кюрасао без алкоголя, лимон, спрайт', vol: '400 мл', price: 360, c: '#46B6FF', c2: '#1778E0', ice: 3, slice: '#F7E03C' },
      { name: 'Strawberry Daiquiri', desc: 'Клубника, лайм, сахарный сироп, колотый лёд', vol: '400 мл', price: 370, c: '#F55D78', ice: 2, slice: '#9BD84A' },
      { name: 'Passion Spritz', desc: 'Маракуйя, ваниль, апельсин, игристая вода', vol: '400 мл', price: 380, c: '#FFD15C', c2: '#FF9F1C', ice: 3, slice: '#FFD43B', tag: 'Новинка' },
    ],
  },
  {
    id: 'dessert',
    name: 'LILU Dessert',
    ru: 'Десертные бабл ти с мороженым',
    text: 'Бабл ти по мотивам любимых десертов: с мороженым, соусами, крошкой и тапиокой.',
    meta: '500 мл',
    items: [
      { name: 'Twix', desc: 'Молочный чай, карамель, песочное печенье, пломбир', vol: '500 мл', price: 450, c: '#D9A56E', c2: '#8A5427', top: 'tapioca', cream: true, drizzle: '#B8742F', crumbs: '#E7C08A' },
      { name: 'Snickers', desc: 'Шоколад, арахисовая паста, карамель, пломбир', vol: '500 мл', price: 450, c: '#B98356', c2: '#5E3A21', top: 'tapioca', cream: true, drizzle: '#6B3E1F', crumbs: '#C9955A', tag: 'Хит' },
      { name: 'Dubai Chocolate', desc: 'Фисташковый крем, хрустящий катаифи, тёмный шоколад', vol: '500 мл', price: 520, c: '#6B3E26', c2: '#8DB255', top: 'tapioca', cream: true, drizzle: '#8DB255', crumbs: '#C8B26A', tag: 'Хит' },
      { name: 'Oreo', desc: 'Молочный коктейль, крошка печенья, ванильное мороженое', vol: '500 мл', price: 450, c: '#E3DED8', c2: '#6D6660', top: 'tapioca', cream: true, drizzle: '#2A2522', crumbs: '#2A2522' },
      { name: 'Raffaello', desc: 'Кокосовое молоко, миндаль, белый шоколад, пломбир', vol: '500 мл', price: 470, c: '#F6F1E7', c2: '#E8DCC6', top: 'jelly', cream: true, drizzle: '#E8DCC6', crumbs: '#FFFFFF' },
      { name: 'Bounty', desc: 'Молочный шоколад, кокосовая стружка, пломбир', vol: '500 мл', price: 450, c: '#EFE4D4', c2: '#5A3421', top: 'tapioca', cream: true, drizzle: '#4B2B1B', crumbs: '#FFFFFF', tag: 'Новинка' },
    ],
  },
  {
    id: 'fruits',
    name: 'LILU Fruits',
    ru: 'Напитки на фруктовом пюре',
    text: 'Густые напитки на пюре из спелых фруктов, со льдом и поппинг-боба.',
    meta: 'M 500 мл · L 700 мл',
    items: [
      { name: 'Mango Passion', desc: 'Пюре манго, маракуйя, поппинг-боба манго', vol: '500 мл', price: 360, c: '#FFBE2E', c2: '#FF9F1C', top: 'popping', pop: '#FFD43B', ice: 2, tag: 'Хит' },
      { name: 'Strawberry Banana', desc: 'Клубничное пюре, банан, йогурт', vol: '500 мл', price: 360, c: '#FF7A8A', c2: '#FFE08A', top: 'popping', pop: '#FF4F6D', ice: 2 },
      { name: 'Watermelon Mint', desc: 'Арбуз, мята, лайм', vol: '500 мл', price: 340, c: '#FF5E6C', ice: 3, mint: true, top: 'popping', pop: '#9BD84A' },
      { name: 'Peach Jasmine', desc: 'Пюре персика, жасминовый чай, кокосовое желе', vol: '500 мл', price: 360, c: '#FFBE93', c2: '#FF9E6B', top: 'jelly', ice: 2 },
      { name: 'Kiwi Apple', desc: 'Киви, зелёное яблоко, лайм', vol: '500 мл', price: 350, c: '#A6D95B', c2: '#7CB83A', top: 'popping', pop: '#D2FF42', ice: 2 },
      { name: 'Pineapple Coconut', desc: 'Ананасовое пюре, кокосовое молоко, желе', vol: '500 мл', price: 370, c: '#FFE066', c2: '#FFF6D6', top: 'jelly', ice: 2, tag: 'Новинка' },
    ],
  },
  {
    id: 'bubble',
    name: 'Bubble Tea',
    ru: 'Классический бабл ти',
    text: 'Молочные и фруктовые чаи на свежезаваренной основе, с тапиокой или поппинг-боба.',
    meta: 'M 500 мл · L 700 мл',
    items: [
      { name: 'Classic Milk Tea', desc: 'Чёрный чай, молоко, тапиока', vol: '500 мл', price: 320, c: '#CFA982', top: 'tapioca', ice: 2, tag: 'Хит' },
      { name: 'Brown Sugar', desc: 'Молоко, тапиока в сиропе из тёмного тростникового сахара', vol: '500 мл', price: 350, c: '#EFE2D2', c2: '#9A5A2A', top: 'tapioca', stripes: '#8B4B1F', ice: 1 },
      { name: 'Taro', desc: 'Таро, молоко, тапиока', vol: '500 мл', price: 340, c: '#BFA3E0', top: 'tapioca', ice: 2 },
      { name: 'Matcha Latte', desc: 'Японская матча, молоко, тапиока', vol: '500 мл', price: 360, c: '#A9CC72', c2: '#EEF0E0', top: 'tapioca', ice: 2 },
      { name: 'Thai Tea', desc: 'Тайский чай, сгущённое молоко, тапиока', vol: '500 мл', price: 340, c: '#F5A04F', top: 'tapioca', ice: 2 },
      { name: 'Lychee Oolong', desc: 'Улун, личи, поппинг-боба личи', vol: '500 мл', price: 340, c: '#F7E2CF', c2: '#F2C6A8', top: 'popping', pop: '#FFF4E8', ice: 3 },
    ],
  },
];

const BUILDER = {
  base: {
    legend: 'Основа',
    options: [
      { id: 'black', label: 'Чёрный молочный', c: '#CFA982' },
      { id: 'jasmine', label: 'Жасминовый', c: '#EBDC8E' },
      { id: 'matcha', label: 'Матча латте', c: '#A9CC72' },
      { id: 'taro', label: 'Таро', c: '#BFA3E0' },
      { id: 'thai', label: 'Тайский', c: '#F5A04F' },
    ],
  },
  topping: {
    legend: 'Топпинг',
    options: [
      { id: 'tapioca', label: 'Тапиока', add: 0, top: 'tapioca' },
      { id: 'mango', label: 'Боба манго', add: 50, top: 'popping', pop: '#FFD43B' },
      { id: 'strawberry', label: 'Боба клубника', add: 50, top: 'popping', pop: '#FF4F6D' },
      { id: 'jelly', label: 'Кокосовое желе', add: 40, top: 'jelly' },
      { id: 'none', label: 'Без топпинга', add: 0, top: 'none' },
    ],
  },
  sweet: {
    legend: 'Сладость',
    options: [0, 25, 50, 75, 100].map(v => ({ id: String(v), label: v + ' %' })),
  },
  ice: {
    legend: 'Лёд',
    options: [
      { id: 'none', label: 'Без льда', ice: 0 },
      { id: 'less', label: 'Мало', ice: 1 },
      { id: 'normal', label: 'Обычно', ice: 3 },
    ],
  },
  size: {
    legend: 'Размер',
    options: [
      { id: 'm', label: 'M', hint: '500 мл', price: 320 },
      { id: 'l', label: 'L', hint: '700 мл', price: 390 },
    ],
  },
};
const BUILDER_DEFAULTS = { base: 'black', topping: 'tapioca', sweet: '50', ice: 'normal', size: 'm' };

/* ---------- SVG cup ---------- */
let uid = 0;
const CUP_BODY = 'M22 44 H98 L90 170 Q89 176 83 176 H37 Q31 176 30 170 Z';
const ICE = [[30, 58, -12], [58, 66, 10], [74, 54, -22], [42, 80, 16]];
const MINT = [[36, 64, 30], [82, 76, -25], [56, 90, 12]];

function cupSVG(d, label = '') {
  const id = 'cup' + (++uid);
  const level = d.cream ? 50 : 58;
  const straw = d.straw || '#0250B0';
  let s = `<svg class="cup" viewBox="0 0 120 184" role="img" aria-label="${label}">`;
  s += `<defs><clipPath id="${id}k"><path d="${CUP_BODY}"/></clipPath>` +
       `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">` +
       `<stop offset=".15" stop-color="${d.c}"/><stop offset="1" stop-color="${d.c2 || d.c}"/></linearGradient></defs>`;

  // straw goes first so the liquid tints the part inside the cup
  s += `<line x1="78" y1="${d.cream ? 2 : 10}" x2="62" y2="168" stroke="${straw}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<path d="${CUP_BODY}" fill="var(--glass)"/>`;

  s += `<g clip-path="url(#${id}k)">`;
  s += `<rect x="0" y="${level}" width="120" height="130" fill="url(#${id}g)" opacity=".9"/>`;
  s += `<rect x="0" y="${level}" width="120" height="3" fill="#fff" opacity=".35"/>`;

  if (d.stripes) {
    for (const [x, y] of [[26, 70], [84, 84], [28, 98], [86, 118], [30, 132]]) {
      s += `<path d="M${x} ${y} q6 8 2 18 q-3 8 3 16" fill="none" stroke="${d.stripes}" stroke-width="5" stroke-linecap="round" opacity=".75"/>`;
    }
  }
  if (d.top === 'tapioca' || d.top === 'popping') {
    const rows = d.top === 'tapioca' ? [[167, 34], [157, 39], [147, 34]] : [[167, 34], [157, 39]];
    const fill = d.top === 'tapioca' ? '#2B1A12' : d.pop;
    rows.forEach(([y, x0]) => {
      for (let x = x0; x < 92; x += 11) {
        s += `<circle cx="${x}" cy="${y}" r="5.4" fill="${fill}"/>`;
        s += `<circle cx="${x - 1.8}" cy="${y - 1.8}" r="1.5" fill="#fff" opacity="${d.top === 'tapioca' ? .35 : .8}"/>`;
      }
    });
  }
  if (d.top === 'jelly') {
    [[40, 162, 12], [52, 156, -18], [64, 164, 30], [76, 157, -8], [46, 146, 40], [70, 147, 5], [58, 168, 0]].forEach(([x, y, r]) => {
      s += `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" rx="2" fill="#FFF8DC" opacity=".85" transform="rotate(${r} ${x} ${y})"/>`;
    });
  }
  ICE.slice(0, d.ice || 0).forEach(([x, y, r]) => {
    s += `<rect x="${x}" y="${y}" width="17" height="17" rx="4" fill="#fff" fill-opacity=".45" stroke="#fff" stroke-opacity=".9" stroke-width="1.5" transform="rotate(${r} ${x + 8} ${y + 8})"/>`;
  });
  if (d.mint) {
    MINT.forEach(([x, y, r]) => {
      s += `<ellipse cx="${x}" cy="${y}" rx="8" ry="3.8" fill="#2FA84F" transform="rotate(${r} ${x} ${y})"/>`;
    });
  }
  if (d.cream && d.crumbs) {
    [[34, 60], [48, 57], [66, 62], [80, 58], [40, 68], [74, 70], [58, 66]].forEach(([x, y]) => {
      s += `<circle cx="${x}" cy="${y}" r="2" fill="${d.crumbs}"/>`;
    });
  }
  // sleeve with the logo
  s += `<rect x="0" y="100" width="120" height="24" fill="#0250B0"/>`;
  s += `<text x="60" y="117" text-anchor="middle" font-size="11" fill="#D2FF42" style="font-family:var(--f-display)">LILU</text>`;
  s += `</g>`;

  s += `<path d="${CUP_BODY}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>`;

  if (d.cream) {
    s += `<path d="M20 44 Q18 26 36 27 Q40 12 56 14 Q66 4 78 14 Q96 12 94 28 Q104 30 100 44 Z" fill="#FFFDF7" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += `<path d="M30 34 Q38 26 44 34 T58 30 T72 34 T88 30" fill="none" stroke="${d.drizzle}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (d.crumbs) {
      [[40, 22], [62, 16], [76, 24], [50, 30], [86, 36]].forEach(([x, y]) => {
        s += `<circle cx="${x}" cy="${y}" r="2.2" fill="${d.crumbs}" stroke="var(--ink)" stroke-width=".6"/>`;
      });
    }
  } else {
    s += `<rect x="16" y="38" width="88" height="9" rx="4.5" fill="var(--lid)" stroke="var(--ink)" stroke-width="2.5"/>`;
  }

  if (d.slice) {
    s += `<g transform="translate(98 44)">` +
         `<circle r="15" fill="${d.slice}" stroke="var(--ink)" stroke-width="2"/>` +
         `<circle r="11" fill="#fff" opacity=".45"/>` +
         [0, 60, 120].map(a => `<line x1="-11" y1="0" x2="11" y2="0" stroke="${d.slice}" stroke-width="1.6" transform="rotate(${a})"/>`).join('') +
         `</g>`;
  }
  return s + `</svg>`;
}

/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const esc = str => String(str).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const money = n => `${n.toLocaleString('ru-RU')} ${CURRENCY}`;

/* ---------- Hero ---------- */
function renderHero() {
  const picks = [CATEGORIES[0].items[1], CATEGORIES[2].items[2], CATEGORIES[3].items[0]];
  $('#heroCups').innerHTML = picks.map(d => cupSVG(d, d.name)).join('');
}

/* ---------- Marquee ---------- */
function renderMarquee() {
  const words = ['Bubble Tea', 'Lemonade', 'Virgin Mojito', 'Piña Colada', 'Dubai Chocolate', 'Mango Passion', 'Matcha', 'Mai Tai', 'Brown Sugar'];
  const row = words.map(w => `<span class="marquee-item">${w}<span class="pearl"></span></span>`).join('');
  $('#marquee').innerHTML = row + row;
}

/* ---------- Menu ---------- */
function renderMenu() {
  $('#chips').innerHTML = CATEGORIES.map(cat =>
    `<a class="chip" href="#cat-${cat.id}" data-cat="${cat.id}">${esc(cat.name)} <small>${cat.items.length}</small></a>`
  ).join('');

  $('#menuGroups').innerHTML = CATEGORIES.map(cat => `
    <section class="group" id="cat-${cat.id}" aria-labelledby="t-${cat.id}">
      <div class="group-head">
        <div>
          <h3 class="group-title" id="t-${cat.id}">${esc(cat.name)}</h3>
          <p class="group-ru">${esc(cat.ru)}</p>
        </div>
        <div>
          <p class="group-text">${esc(cat.text)}</p>
          <p class="group-meta">${esc(cat.meta)}</p>
        </div>
      </div>
      <div class="drinks">
        ${cat.items.map(d => `
          <article class="drink" style="--c:${d.c}">
            <div class="drink-visual">
              ${cupSVG(d, d.name)}
              ${d.tag ? `<span class="tag${d.tag === 'Новинка' ? ' tag-new' : ''}">${esc(d.tag)}</span>` : ''}
            </div>
            <div class="drink-body">
              <h4 class="drink-name">${esc(d.name)}</h4>
              <p class="drink-desc">${esc(d.desc)}</p>
              <div class="drink-meta">
                <span class="vol">${esc(d.vol)}</span>
                <span class="price">${money(d.price)}</span>
              </div>
            </div>
          </article>`).join('')}
      </div>
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
  setActive(CATEGORIES[0].id);
  window.addEventListener('resize', () => setActive(bar.querySelector('.chip.is-active').dataset.cat));
  if (document.fonts) document.fonts.ready.then(() => setActive(bar.querySelector('.chip.is-active').dataset.cat));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id.replace('cat-', '')); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.group').forEach(g => io.observe(g));
  }
}

/* ---------- Builder ---------- */
function renderBuilder() {
  const form = $('#builderForm');
  form.innerHTML = Object.entries(BUILDER).map(([key, group]) => `
    <fieldset class="opt-group">
      <legend>${group.legend}</legend>
      <div class="opts">
        ${group.options.map(o => `
          <label class="opt">
            <input type="radio" name="${key}" id="b-${key}-${o.id}" value="${o.id}"${BUILDER_DEFAULTS[key] === o.id ? ' checked' : ''}>
            <span>${o.c ? `<i style="background:${o.c}"></i>` : ''}${esc(o.label)}${o.hint ? ` <b>${o.hint}</b>` : ''}${o.add ? ` <b>+${o.add}</b>` : ''}</span>
          </label>`).join('')}
      </div>
    </fieldset>`).join('');
  form.addEventListener('change', updateBuilder);
  form.addEventListener('submit', e => e.preventDefault());
  updateBuilder();
}

function builderState() {
  const form = $('#builderForm');
  const pick = key => BUILDER[key].options.find(o => o.id === form.elements[key].value);
  return { base: pick('base'), topping: pick('topping'), sweet: pick('sweet'), ice: pick('ice'), size: pick('size') };
}

function orderText(st) {
  const parts = [
    st.base.label,
    st.topping.id === 'none' ? 'без топпинга' : st.topping.label.toLowerCase(),
    `сладость ${st.sweet.label}`,
    st.ice.id === 'none' ? 'без льда' : st.ice.id === 'less' ? 'мало льда' : 'обычный лёд',
    `${st.size.label} ${st.size.hint}`,
  ];
  return parts.join(' · ');
}

function updateBuilder() {
  const st = builderState();
  const drink = {
    c: st.base.c,
    c2: st.base.id === 'matcha' ? '#EEF0E0' : undefined,
    top: st.topping.top,
    pop: st.topping.pop,
    ice: st.ice.ice,
  };
  $('#builderCup').innerHTML = cupSVG(drink, 'Ваш бабл ти');
  $('#summaryText').textContent = orderText(st);
  $('#summaryPrice').textContent = money(st.size.price + (st.topping.add || 0));
  $('#copyStatus').textContent = '';
}

function initCopy() {
  $('#copyOrder').addEventListener('click', () => {
    const st = builderState();
    const text = `LILU Bubble Tea: ${orderText(st)} — ${$('#summaryPrice').textContent}`;
    const done = () => { $('#copyStatus').textContent = 'Заказ скопирован. Отправьте его нам или покажите бариста.'; };
    const fallback = () => {
      const r = document.createRange();
      r.selectNodeContents($('#summaryText'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      $('#copyStatus').textContent = 'Текст заказа выделен. Нажмите Ctrl+C или «Копировать».';
    };
    try {
      navigator.clipboard.writeText(text).then(done, fallback);
    } catch (e) {
      fallback();
    }
  });
}

renderHero();
renderMarquee();
renderMenu();
renderBuilder();
initCopy();
