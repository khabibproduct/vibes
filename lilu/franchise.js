// LILU Drinks — страница франшизы: форматы, калькулятор окупаемости, заявка.
// Все цифры — ориентировочные, в сомони (TJS); поменяйте их в FRANCHISE и FORMATS.

const CURRENCY = 'сом.';   // сомони

// Куда отправлять заявки (например, Formspree, свой API или вебхук CRM). Пока пусто — заявка копируется в буфер.
const FORM_ENDPOINT = '';
const FALLBACK_CONTACT = 'Telegram @lilu_franchise';

const FRANCHISE = {
  lumpSum: 60000,    // паушальный взнос, входит в инвестиции
  royalty: 0.05,     // роялти от выручки
  marketing: 0.01,   // маркетинговый сбор от выручки
  cogs: 0.30,        // себестоимость напитков от выручки
  other: 0.10,       // эквайринг, коммунальные, расходники, налоги
  days: 30,
};

const FORMATS = [
  {
    id: 'togo', name: 'LILU To Go', ru: 'Киоск навынос', area: '6–10 м²',
    text: 'Точка в потоке людей: у метро, в бизнес-центре, на фудкорте. Только навынос.',
    invest: 200000, payroll: 9000, rent: 5000, cups: 80, check: 35, staff: '2–3 человека', menu: 'сокращённое меню',
  },
  {
    id: 'island', name: 'LILU Island', ru: 'Остров в торговом центре', area: '12–20 м²', featured: true,
    text: 'Самый популярный формат: стойка в ТЦ с полным меню и витриной напитков.',
    invest: 350000, payroll: 14000, rent: 10000, cups: 120, check: 38, staff: '4 человека', menu: 'полное меню',
  },
  {
    id: 'lounge', name: 'LILU Lounge', ru: 'Бар с посадкой', area: '40–70 м²',
    text: 'Полноценный безалкогольный бар с посадкой, коктейльной линейкой и десертами.',
    invest: 700000, payroll: 28000, rent: 20000, cups: 200, check: 45, staff: '6–8 человек', menu: 'полное меню и десерты',
  },
];

const $ = sel => document.querySelector(sel);
const money = n => `${Math.round(n).toLocaleString('ru-RU')} ${CURRENCY}`;
const thousands = n => `${(n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} тыс. ${CURRENCY}`;
// суммы от миллиона пишем в млн, остальные в тысячах
const mln = n => n >= 1e6
  ? `${(n / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн ${CURRENCY}`
  : thousands(n);
const pct = x => `${Math.round(x * 100)} %`;

function economics({ invest, payroll, rent, cups, check }) {
  const revenue = cups * check * FRANCHISE.days;
  const lines = [
    { label: 'Себестоимость', value: revenue * FRANCHISE.cogs },
    { label: 'Зарплаты', value: payroll },
    { label: 'Аренда', value: rent },
    { label: 'Роялти и маркетинг', value: revenue * (FRANCHISE.royalty + FRANCHISE.marketing) },
    { label: 'Прочие расходы', value: revenue * FRANCHISE.other },
  ];
  const costs = lines.reduce((sum, l) => sum + l.value, 0);
  const profit = revenue - costs;
  const payback = profit > 0 ? Math.ceil(invest / profit) : null;
  return { revenue, lines, profit, payback };
}

function monthsLabel(n) {
  const m10 = n % 10, m100 = n % 100;
  const word = m10 === 1 && m100 !== 11 ? 'месяц' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'месяца' : 'месяцев';
  return `${n} ${word}`;
}

/* ---------- Hero KPIs & formats ---------- */
function renderStatic() {
  const base = FORMATS.map(f => ({ ...f, eco: economics(f) }));
  const minInvest = Math.min(...base.map(f => f.invest));
  const paybacks = base.map(f => f.eco.payback).filter(Boolean);
  const minPayback = paybacks.length ? Math.min(...paybacks) : null;

  $('#heroKpis').innerHTML = [
    ['Инвестиции', `от ${mln(minInvest)}`],
    ['Окупаемость', minPayback ? `от ${minPayback} мес.` : '—'],
    ['Паушальный взнос', thousands(FRANCHISE.lumpSum)],
    ['Роялти', pct(FRANCHISE.royalty)],
  ].map(([k, v]) => `<div class="f-kpi"><dt>${k}</dt><dd>${v}</dd></div>`).join('');

  $('#whyMargin').textContent = `Себестоимость напитка — около ${pct(FRANCHISE.cogs)} от цены в меню. Остальное покрывает аренду, команду и приносит прибыль.`;

  $('#formatCards').innerHTML = base.map(f => `
    <article class="format glass${f.featured ? ' is-featured' : ''}">
      <div class="format-top">
        <div>
          <h3 class="format-name">${f.name}</h3>
          <p class="format-ru">${f.ru}</p>
        </div>
        <span class="format-area">${f.area}</span>
      </div>
      <p>${f.text}</p>
      <dl class="format-specs">
        <div><dt>Инвестиции</dt><dd>от ${mln(f.invest)}</dd></div>
        <div><dt>Окупаемость</dt><dd>${f.eco.payback ? `от ${f.eco.payback} мес.` : '—'}</dd></div>
        <div><dt>Прибыль в месяц</dt><dd>≈ ${thousands(f.eco.profit)}</dd></div>
        <div><dt>Команда</dt><dd>${f.staff}</dd></div>
        <div><dt>Меню</dt><dd>${f.menu}</dd></div>
      </dl>
    </article>`).join('');

  const select = $('#aFormat');
  FORMATS.forEach(f => {
    const opt = document.createElement('option');
    opt.textContent = `${f.name} — ${f.ru.toLowerCase()}`;
    select.appendChild(opt);
  });
}

/* ---------- Calculator ---------- */
let current = FORMATS.find(f => f.featured) || FORMATS[0];

function renderCalcControls() {
  $('#calcFormat').innerHTML = FORMATS.map(f => `
    <input type="radio" name="calcFormat" id="cf-${f.id}" value="${f.id}"${f.id === current.id ? ' checked' : ''}>
    <label for="cf-${f.id}">${f.name.replace('LILU ', '')}</label>`).join('');

  $('#calcFormat').addEventListener('change', e => {
    current = FORMATS.find(f => f.id === e.target.value);
    setSliders(current);
    updateCalc();
  });
  ['#calcCups', '#calcCheck', '#calcRent'].forEach(id => $(id).addEventListener('input', updateCalc));
  $('#calcForm').addEventListener('submit', e => e.preventDefault());
  setSliders(current);
  updateCalc();
}

function setSliders(f) {
  $('#calcCups').value = f.cups;
  $('#calcCheck').value = f.check;
  $('#calcRent').value = f.rent;
}

function paintRange(input) {
  const p = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.setProperty('--p', `${p}%`);
}

function updateCalc() {
  const cups = +$('#calcCups').value;
  const check = +$('#calcCheck').value;
  const rent = +$('#calcRent').value;
  ['#calcCups', '#calcCheck', '#calcRent'].forEach(id => paintRange($(id)));

  $('#calcCupsOut').textContent = cups.toLocaleString('ru-RU');
  $('#calcCheckOut').textContent = money(check);
  $('#calcRentOut').textContent = thousands(rent);
  $('#calcNote').textContent = `${current.name}: инвестиции от ${mln(current.invest)}, зарплаты команды ≈ ${thousands(current.payroll)} в месяц.`;

  const eco = economics({ invest: current.invest, payroll: current.payroll, rent, cups, check });
  $('#kRevenue').textContent = thousands(eco.revenue);
  $('#kProfit').textContent = eco.profit > 0 ? thousands(eco.profit) : 'нет прибыли';
  $('#kPayback').textContent = eco.payback ? monthsLabel(eco.payback) : '—';

  const rows = [...eco.lines, { label: 'Прибыль', value: Math.max(eco.profit, 0), profit: true }];
  $('#breakdown').innerHTML = rows.map(r => {
    const share = eco.revenue ? Math.min(r.value / eco.revenue, 1) : 0;
    return `<div class="bd-row${r.profit ? ' is-profit' : ''}">
      <span>${r.label}</span>
      <span class="bd-bar"><i style="width:${(share * 100).toFixed(1)}%"></i></span>
      <b>${pct(share)}</b>
    </div>`;
  }).join('');

  $('#calcDisclaimer').textContent = eco.profit > 0
    ? `Расчёт на ${FRANCHISE.days} дней работы: себестоимость ${pct(FRANCHISE.cogs)}, роялти ${pct(FRANCHISE.royalty)}, маркетинг ${pct(FRANCHISE.marketing)}, прочие расходы ${pct(FRANCHISE.other)} от выручки. Не является публичной офертой.`
    : 'При этих параметрах расходы больше выручки. Увеличьте поток гостей или выберите локацию с арендой ниже.';
}

/* ---------- Application form ---------- */
function initApply() {
  const form = $('#applyForm');
  const status = $('#applyStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const missing = ['aName', 'aPhone', 'aCity'].filter(id => !$('#' + id).value.trim());
    if (missing.length) {
      status.textContent = 'Заполните имя, телефон и город.';
      $('#' + missing[0]).focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const text = `Заявка на франшизу LILU\nИмя: ${data.name}\nТелефон: ${data.phone}\nГород: ${data.city}\nФормат: ${data.format}\nБюджет: ${data.budget}\nКомментарий: ${data.message || '—'}`;

    if (FORM_ENDPOINT) {
      status.textContent = 'Отправляем…';
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        status.textContent = 'Заявка отправлена. Менеджер свяжется с вами в течение рабочего дня.';
        form.reset();
      } catch (err) {
        status.textContent = `Не получилось отправить заявку. Напишите нам: ${FALLBACK_CONTACT}.`;
      }
      return;
    }

    // no endpoint configured yet: hand the text to the visitor
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = `Онлайн-отправка пока не подключена. Текст заявки скопирован — отправьте его нам: ${FALLBACK_CONTACT}.`;
    } catch (err) {
      status.textContent = `Онлайн-отправка пока не подключена. Напишите нам: ${FALLBACK_CONTACT}.`;
    }
  });
}

renderStatic();
renderCalcControls();
initApply();
