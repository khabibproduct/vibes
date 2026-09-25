import { html, $, $$, icons, speak, toast } from "../dom.js";
import { deleteSet, resetProgress, toggleStar, MASTERED } from "../store.js";
import { getStarredOnly, setStarredOnly } from "../study.js";
import { plural } from "../utils.js";

const MODES = [
  { path: "cards", emoji: "🗂️", title: "Карточки", hint: "Переворачивайте и повторяйте" },
  { path: "learn", emoji: "🧠", title: "Заучивание", hint: "Адаптивные вопросы до полного запоминания" },
  { path: "test", emoji: "📝", title: "Тест", hint: "Проверьте себя" },
  { path: "match", emoji: "⚡", title: "Подбор", hint: "Соберите пары на время" },
];

function stats(cards) {
  const counts = { fresh: 0, learning: 0, mastered: 0 };
  cards.forEach((card) => {
    if (card.level >= MASTERED) counts.mastered++;
    else if (card.level > 0) counts.learning++;
    else counts.fresh++;
  });
  return counts;
}

function exportText(set) {
  return set.cards.map((card) => `${card.term}\t${card.definition}`).join("\n");
}

export function renderSet(root, { set }) {
  const total = set.cards.length;
  const counts = stats(set.cards);
  const starredCount = set.cards.filter((card) => card.starred).length;

  root.innerHTML = html`
    <div class="set-page">
    <div class="set-header">
      <div>
        <h1>${set.title}</h1>
        ${set.description ? html`<p class="muted">${set.description}</p>` : ""}
        <p class="muted small">${total} ${plural(total, ["термин", "термина", "терминов"])}</p>
      </div>
      <div class="set-actions">
        <a class="btn btn-secondary" href="#/set/${set.id}/edit">Редактировать</a>
        <details class="menu">
          <summary class="btn btn-secondary" aria-label="Ещё">•••</summary>
          <div class="menu-list">
            <button type="button" data-action="export">Скопировать как текст</button>
            <button type="button" data-action="reset">Сбросить прогресс</button>
            <button type="button" data-action="delete" class="danger">Удалить набор</button>
          </div>
        </details>
      </div>
    </div>

    <div class="mode-grid">
      ${MODES.map(
        (mode) => html`
          <a class="mode-tile" href="#/set/${set.id}/${mode.path}">
            <span class="mode-emoji">${mode.emoji}</span>
            <span class="mode-name">${mode.title}</span>
            <span class="mode-hint">${mode.hint}</span>
          </a>
        `
      )}
    </div>

    <label class="checkbox">
      <input type="checkbox" data-starred-only ${getStarredOnly() ? "checked" : ""} />
      <span>Учить только отмеченные ★ (<span data-starred-count>${starredCount}</span>)</span>
    </label>

    <section class="panel">
      <h2>Ваш прогресс</h2>
      <div class="stats">
        <div class="stat"><span class="stat-num">${counts.fresh}</span><span class="stat-label">Не изучено</span></div>
        <div class="stat stat-learning"><span class="stat-num">${counts.learning}</span><span class="stat-label">Изучается</span></div>
        <div class="stat stat-mastered"><span class="stat-num">${counts.mastered}</span><span class="stat-label">Выучено</span></div>
      </div>
      <div class="progress progress-split" aria-hidden="true">
        <div class="progress-bar mastered" style="width: ${total ? (counts.mastered / total) * 100 : 0}%"></div>
        <div class="progress-bar learning" style="width: ${total ? (counts.learning / total) * 100 : 0}%"></div>
      </div>
    </section>

    <section>
      <h2>Термины в наборе</h2>
      <ul class="term-list">
        ${set.cards.map(
          (card) => html`
            <li class="term-row" data-card="${card.id}">
              <div class="term-cell">${card.term}</div>
              <div class="term-cell definition">${card.definition}</div>
              <div class="term-tools">
                <button type="button" class="icon-btn" data-speak aria-label="Озвучить">${icons.sound}</button>
                <button type="button" class="icon-btn star ${card.starred ? "active" : ""}" data-star
                  aria-label="Отметить" aria-pressed="${card.starred}">${icons.star}</button>
              </div>
            </li>
          `
        )}
      </ul>
    </section>
    </div>
  `;
  const page = root.firstElementChild;

  $("[data-starred-only]", root).addEventListener("change", (event) => {
    setStarredOnly(event.target.checked);
  });

  $$(".term-row", root).forEach((row) => {
    const card = set.cards.find((c) => c.id === row.dataset.card);
    $("[data-speak]", row).addEventListener("click", () => speak(card.term));
    $("[data-star]", row).addEventListener("click", (event) => {
      const starred = toggleStar(set.id, card.id);
      event.currentTarget.classList.toggle("active", starred);
      event.currentTarget.setAttribute("aria-pressed", String(starred));
      $("[data-starred-count]", root).textContent = set.cards.filter((c) => c.starred).length;
    });
  });

  // Слушаем на .set-page, а не на root: после перерисовки старый слушатель уходит вместе с разметкой.
  page.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    event.target.closest("details")?.removeAttribute("open");
    if (action === "export") {
      try {
        await navigator.clipboard.writeText(exportText(set));
        toast("Набор скопирован в буфер обмена");
      } catch {
        toast("Не удалось скопировать");
      }
    } else if (action === "reset") {
      if (confirm("Сбросить прогресс заучивания по этому набору?")) {
        resetProgress(set.id);
        renderSet(root, { set });
        toast("Прогресс сброшен");
      }
    } else if (action === "delete") {
      if (confirm(`Удалить набор «${set.title}»? Это действие нельзя отменить.`)) {
        deleteSet(set.id);
        location.hash = "#/";
        toast("Набор удалён");
      }
    }
  });
}
