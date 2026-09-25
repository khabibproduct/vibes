import { html, $, icons, speak } from "../dom.js";
import { toggleStar, markStudied } from "../store.js";
import { studyCards, promptOf, answerOf, modeHeader, bindModeHeader } from "../study.js";
import { shuffle, plural } from "../utils.js";

export function renderFlashcards(root, { set }) {
  let deck = [];
  let index = 0;
  let flipped = false;
  let shuffled = false;
  let known = [];
  let learning = [];
  let history = [];

  function start(cards) {
    deck = shuffled ? shuffle(cards) : cards.slice();
    index = 0;
    flipped = false;
    known = [];
    learning = [];
    history = [];
    markStudied(set.id);
    draw();
  }

  function draw() {
    if (index >= deck.length) {
      drawSummary();
      return;
    }
    const card = deck[index];
    root.innerHTML = html`
      ${modeHeader(set, "Карточки")}
      <div class="flash-counters">
        <span class="counter counter-learning" title="Ещё изучаю">${learning.length}</span>
        <span class="muted">${index + 1} / ${deck.length}</span>
        <span class="counter counter-known" title="Знаю">${known.length}</span>
      </div>
      <div class="flashcard-scene">
        <div class="flashcard ${flipped ? "flipped" : ""}" tabindex="0" role="button"
          aria-label="Перевернуть карточку">
          <div class="flashcard-face front">
            <div class="flashcard-tools">
              <button type="button" class="icon-btn" data-speak="front" aria-label="Озвучить">${icons.sound}</button>
              <button type="button" class="icon-btn star ${card.starred ? "active" : ""}" data-star
                aria-label="Отметить">${icons.star}</button>
            </div>
            <div class="flashcard-text">${promptOf(card)}</div>
            <div class="flashcard-hint">Нажмите, чтобы перевернуть</div>
          </div>
          <div class="flashcard-face back">
            <div class="flashcard-tools">
              <button type="button" class="icon-btn" data-speak="back" aria-label="Озвучить">${icons.sound}</button>
              <button type="button" class="icon-btn star ${card.starred ? "active" : ""}" data-star
                aria-label="Отметить">${icons.star}</button>
            </div>
            <div class="flashcard-text">${answerOf(card)}</div>
          </div>
        </div>
      </div>
      <div class="flash-controls">
        <button type="button" class="icon-btn" data-undo aria-label="Отменить" title="Отменить (Backspace)"
          ${history.length ? "" : "disabled"}>↶</button>
        <button type="button" class="btn btn-round btn-learning" data-learning title="Ещё изучаю (←)">
          ✕ <span class="hide-sm">Ещё изучаю</span>
        </button>
        <button type="button" class="btn btn-round btn-known" data-known title="Знаю (→)">
          ✓ <span class="hide-sm">Знаю</span>
        </button>
        <button type="button" class="icon-btn ${shuffled ? "active" : ""}" data-shuffle
          aria-pressed="${shuffled}" title="Перемешать">${icons.shuffle}</button>
      </div>
      <p class="muted small center">Пробел — перевернуть, ← ещё изучаю, → знаю</p>
    `;

    bindModeHeader(root, () => draw());
    const flashcard = $(".flashcard", root);
    flashcard.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      flip();
    });
    root.querySelectorAll("[data-speak]").forEach((button) =>
      button.addEventListener("click", () =>
        speak(button.dataset.speak === "front" ? promptOf(card) : answerOf(card))
      )
    );
    root.querySelectorAll("[data-star]").forEach((button) =>
      button.addEventListener("click", () => {
        card.starred = toggleStar(set.id, card.id);
        root.querySelectorAll("[data-star]").forEach((b) => b.classList.toggle("active", card.starred));
      })
    );
    $("[data-learning]", root).addEventListener("click", () => answer(false));
    $("[data-known]", root).addEventListener("click", () => answer(true));
    $("[data-undo]", root).addEventListener("click", undo);
    $("[data-shuffle]", root).addEventListener("click", () => {
      shuffled = !shuffled;
      // Перемешиваем только оставшиеся карточки, пройденные не трогаем.
      const rest = deck.slice(index);
      const ordered = shuffled ? shuffle(rest) : set.cards.filter((card) => rest.includes(card));
      deck = deck.slice(0, index).concat(ordered);
      flipped = false;
      draw();
    });
  }

  function drawSummary() {
    const total = known.length + learning.length;
    const percent = total ? Math.round((known.length / total) * 100) : 0;
    root.innerHTML = html`
      ${modeHeader(set, "Карточки")}
      <div class="result-card">
        <div class="result-emoji">${percent === 100 ? "🎉" : "💪"}</div>
        <h2>${percent === 100 ? "Отлично! Вы знаете все карточки." : "Хорошая работа! Продолжайте повторять."}</h2>
        <div class="stats">
          <div class="stat stat-mastered"><span class="stat-num">${known.length}</span><span class="stat-label">Знаю</span></div>
          <div class="stat stat-learning"><span class="stat-num">${learning.length}</span><span class="stat-label">Ещё изучаю</span></div>
        </div>
        <div class="result-actions">
          ${learning.length
            ? html`<button type="button" class="btn btn-primary" data-again-learning>
                Повторить ${learning.length} ${plural(learning.length, ["карточку", "карточки", "карточек"])}
              </button>`
            : ""}
          <button type="button" class="btn btn-secondary" data-restart>Начать заново</button>
          <a class="btn btn-secondary" href="#/set/${set.id}/learn">Перейти к заучиванию</a>
        </div>
      </div>
    `;
    bindModeHeader(root, () => drawSummary());
    $("[data-again-learning]", root)?.addEventListener("click", () => start(learning));
    $("[data-restart]", root).addEventListener("click", () => start(studyCards(set)));
  }

  function flip() {
    flipped = !flipped;
    $(".flashcard", root)?.classList.toggle("flipped", flipped);
  }

  function answer(isKnown) {
    if (index >= deck.length) return;
    const card = deck[index];
    (isKnown ? known : learning).push(card);
    history.push(isKnown);
    index++;
    flipped = false;
    draw();
  }

  function undo() {
    if (!history.length) return;
    const wasKnown = history.pop();
    (wasKnown ? known : learning).pop();
    index--;
    flipped = false;
    draw();
  }

  function onKeydown(event) {
    if (event.target.closest("input, textarea, select") || index >= deck.length) return;
    if (event.key === " " || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      flip();
    } else if (event.key === "ArrowLeft") {
      answer(false);
    } else if (event.key === "ArrowRight") {
      answer(true);
    } else if (event.key === "Backspace") {
      undo();
    }
  }

  document.addEventListener("keydown", onKeydown);
  start(studyCards(set));
  return () => document.removeEventListener("keydown", onKeydown);
}
