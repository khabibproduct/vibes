import { html, $ } from "../dom.js";
import { listSets, MASTERED } from "../store.js";
import { plural } from "../utils.js";

function setTile(set) {
  const total = set.cards.length;
  const mastered = set.cards.filter((card) => card.level >= MASTERED).length;
  const percent = total ? Math.round((mastered / total) * 100) : 0;
  return html`
    <a class="set-tile" href="#/set/${set.id}">
      <div class="set-tile-title">${set.title}</div>
      <div class="set-tile-meta">${total} ${plural(total, ["термин", "термина", "терминов"])}</div>
      ${set.description ? html`<div class="set-tile-desc">${set.description}</div>` : ""}
      <div class="progress" title="Выучено ${percent}%">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
      <div class="set-tile-meta">Выучено ${percent}%</div>
    </a>
  `;
}

export function renderHome(root) {
  const sets = listSets();

  if (!sets.length) {
    root.innerHTML = html`
      <div class="empty-state">
        <div class="empty-emoji">📚</div>
        <h1>Пока нет ни одного набора</h1>
        <p>Создайте первый набор карточек — и начните учить.</p>
        <a class="btn btn-primary" href="#/new">Создать набор</a>
      </div>
    `;
    return;
  }

  root.innerHTML = html`
    <div class="page-header">
      <h1>Мои наборы</h1>
      <input class="input search" type="search" placeholder="Поиск по наборам…" aria-label="Поиск по наборам" />
    </div>
    <div class="set-grid"></div>
  `;

  const grid = $(".set-grid", root);
  const search = $(".search", root);

  function draw() {
    const query = search.value.trim().toLowerCase();
    const visible = sets.filter((set) =>
      !query ||
      set.title.toLowerCase().includes(query) ||
      set.cards.some((card) =>
        card.term.toLowerCase().includes(query) || card.definition.toLowerCase().includes(query)
      )
    );
    grid.innerHTML = visible.length
      ? html`${visible.map(setTile)}`
      : html`<p class="muted">Ничего не найдено.</p>`;
  }

  search.addEventListener("input", draw);
  draw();
}
