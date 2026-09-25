import { html, $, $$ } from "../dom.js";
import { markStudied, getBestMatchTime, recordMatchTime } from "../store.js";
import { studyCards, promptOf, answerOf, modeHeader, bindModeHeader } from "../study.js";
import { shuffle, formatTime } from "../utils.js";

const PAIRS = 6;
const PENALTY_MS = 1000;

export function renderMatch(root, { set }) {
  let timer = null;
  let startedAt = 0;
  let penalty = 0;
  let finishTimer = null;

  function stopTimer() {
    clearInterval(timer);
    clearTimeout(finishTimer);
    timer = null;
  }

  function elapsed() {
    return Date.now() - startedAt + penalty;
  }

  function drawIntro() {
    stopTimer();
    const best = getBestMatchTime(set.id);
    root.innerHTML = html`
      ${modeHeader(set, "Подбор", { answerSelect: false })}
      <div class="result-card">
        <div class="result-emoji">⚡</div>
        <h2>Готовы играть?</h2>
        <p class="muted">Соедините все термины с их определениями как можно быстрее.
          За ошибку — штраф +1 секунда.</p>
        ${best != null ? html`<p>Ваш рекорд: <b>${formatTime(best)}</b></p>` : ""}
        <button type="button" class="btn btn-primary btn-lg" data-start>Начать игру</button>
      </div>
    `;
    bindModeHeader(root, drawIntro);
    $("[data-start]", root).addEventListener("click", play);
  }

  function play() {
    const cards = shuffle(studyCards(set)).slice(0, PAIRS);
    const tiles = shuffle(
      cards.flatMap((card) => [
        { cardId: card.id, text: promptOf(card) },
        { cardId: card.id, text: answerOf(card) },
      ])
    );
    let remaining = cards.length;
    let selected = null;
    penalty = 0;
    markStudied(set.id);

    root.innerHTML = html`
      ${modeHeader(set, "Подбор", { answerSelect: false })}
      <div class="match-timer" aria-live="off">0.0 с</div>
      <div class="match-grid">
        ${tiles.map(
          (tile, i) => html`<button type="button" class="match-tile" data-tile="${i}">${tile.text}</button>`
        )}
      </div>
    `;
    bindModeHeader(root, drawIntro);

    const timerEl = $(".match-timer", root);
    startedAt = Date.now();
    timer = setInterval(() => (timerEl.textContent = formatTime(elapsed())), 100);

    $$(".match-tile", root).forEach((button) =>
      button.addEventListener("click", () => {
        const tile = tiles[Number(button.dataset.tile)];
        if (button.classList.contains("matched")) return;
        if (!selected) {
          selected = { button, tile };
          button.classList.add("selected");
          return;
        }
        if (selected.button === button) {
          button.classList.remove("selected");
          selected = null;
          return;
        }
        const first = selected;
        selected = null;
        first.button.classList.remove("selected");
        if (first.tile.cardId === tile.cardId) {
          [first.button, button].forEach((b) => {
            b.classList.add("matched");
            b.disabled = true;
          });
          remaining--;
          if (!remaining) finish();
        } else {
          penalty += PENALTY_MS;
          [first.button, button].forEach((b) => {
            b.classList.add("mismatch");
            setTimeout(() => b.classList.remove("mismatch"), 450);
          });
        }
      })
    );
  }

  function finish() {
    const total = elapsed();
    stopTimer();
    const previousBest = getBestMatchTime(set.id);
    const isRecord = recordMatchTime(set.id, total);
    // Небольшая пауза, чтобы успела проиграться анимация последней пары.
    finishTimer = setTimeout(() => {
      root.innerHTML = html`
        ${modeHeader(set, "Подбор", { answerSelect: false })}
        <div class="result-card">
          <div class="result-emoji">${isRecord ? "🏅" : "🎯"}</div>
          <h2>${isRecord ? "Новый рекорд!" : "Готово!"}</h2>
          <p class="big-time">${formatTime(total)}</p>
          ${penalty ? html`<p class="muted small">включая штраф ${formatTime(penalty)}</p>` : ""}
          ${previousBest != null && !isRecord ? html`<p class="muted">Рекорд: ${formatTime(previousBest)}</p>` : ""}
          <div class="result-actions">
            <button type="button" class="btn btn-primary" data-again>Играть снова</button>
            <a class="btn btn-secondary" href="#/set/${set.id}">К набору</a>
          </div>
        </div>
      `;
      bindModeHeader(root, drawIntro);
      $("[data-again]", root).addEventListener("click", play);
    }, 350);
  }

  drawIntro();
  return stopTimer;
}
