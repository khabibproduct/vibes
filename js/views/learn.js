import { html, $, $$, icons, speak } from "../dom.js";
import { setCardLevel, resetProgress, markStudied, MASTERED } from "../store.js";
import { studyCards, promptOf, answerOf, modeHeader, bindModeHeader } from "../study.js";
import { buildChoices, pickRound } from "../quiz.js";
import { checkAnswer, plural } from "../utils.js";

const ROUND_SIZE = 7;
const AUTO_ADVANCE_MS = 900;

export function renderLearn(root, { set }) {
  let cards = [];
  let queue = [];
  let roundCards = [];
  let roundNumber = 0;
  let current = null;
  // Ожидаем «Продолжить» после ответа; хранит функцию перехода дальше.
  let pendingContinue = null;
  let advanceTimer = null;

  function levelLabel(level) {
    if (level >= MASTERED) return "Выучено";
    return level > 0 ? "Изучается" : "Не изучено";
  }

  function progressBar() {
    const mastered = cards.filter((card) => card.level >= MASTERED).length;
    const learning = cards.filter((card) => card.level > 0 && card.level < MASTERED).length;
    const total = cards.length || 1;
    return html`
      <div class="learn-progress">
        <div class="progress progress-split">
          <div class="progress-bar mastered" style="width: ${(mastered / total) * 100}%"></div>
          <div class="progress-bar learning" style="width: ${(learning / total) * 100}%"></div>
        </div>
        <div class="learn-progress-labels muted small">
          <span>Выучено: ${mastered} из ${cards.length}</span>
          <span>Изучается: ${learning}</span>
        </div>
      </div>
    `;
  }

  function start() {
    cards = studyCards(set);
    roundNumber = 0;
    markStudied(set.id);
    nextRound();
  }

  function nextRound() {
    roundCards = pickRound(cards, MASTERED, ROUND_SIZE);
    if (!roundCards.length) {
      drawFinished();
      return;
    }
    roundNumber++;
    queue = roundCards.slice();
    nextQuestion();
  }

  function nextQuestion() {
    clearTimeout(advanceTimer);
    pendingContinue = null;
    if (!queue.length) {
      drawRoundSummary();
      return;
    }
    current = queue.shift();
    if (current.level === 0) drawChoice(current);
    else drawWritten(current);
  }

  function questionShell(card, kind, body) {
    return html`
      ${modeHeader(set, "Заучивание")}
      ${progressBar()}
      <div class="question-card">
        <div class="question-top">
          <span class="muted small">${kind}</span>
          <button type="button" class="icon-btn" data-speak aria-label="Озвучить">${icons.sound}</button>
        </div>
        <div class="question-prompt">${promptOf(card)}</div>
        ${body}
      </div>
    `;
  }

  function bindCommon(card) {
    bindModeHeader(root, start);
    $("[data-speak]", root).addEventListener("click", () => speak(promptOf(card)));
  }

  function drawChoice(card) {
    const pool = set.cards.filter((c) => c.term && c.definition).map((c) => answerOf(c));
    const choices = buildChoices(answerOf(card), pool);
    root.innerHTML = questionShell(
      card,
      "Выберите правильный ответ",
      html`
        <div class="choices">
          ${choices.map(
            (choice, i) => html`
              <button type="button" class="choice" data-choice="${i}">
                <span class="choice-key">${i + 1}</span>
                <span>${choice}</span>
              </button>
            `
          )}
        </div>
        <div class="feedback" aria-live="polite"></div>
      `
    );
    bindCommon(card);
    $$("[data-choice]", root).forEach((button) =>
      button.addEventListener("click", () => {
        if (pendingContinue || button.disabled) return;
        const chosen = choices[Number(button.dataset.choice)];
        const correct = chosen === answerOf(card);
        $$("[data-choice]", root).forEach((b) => {
          b.disabled = true;
          if (choices[Number(b.dataset.choice)] === answerOf(card)) b.classList.add("correct");
        });
        if (!correct) button.classList.add("wrong");
        finishAnswer(card, correct);
      })
    );
  }

  function drawWritten(card) {
    root.innerHTML = questionShell(
      card,
      "Напишите ответ",
      html`
        <form class="written-form" autocomplete="off">
          <input class="input input-lg" data-answer placeholder="Введите ответ" aria-label="Ваш ответ" />
          <div class="written-actions">
            <button type="button" class="btn btn-ghost" data-dont-know>Не знаю</button>
            <button type="submit" class="btn btn-primary">Ответить</button>
          </div>
        </form>
        <div class="feedback" aria-live="polite"></div>
      `
    );
    bindCommon(card);
    const form = $(".written-form", root);
    const input = $("[data-answer]", root);
    input.focus();

    function submit(given) {
      if (pendingContinue) return;
      input.disabled = true;
      $$(".written-actions button", root).forEach((b) => (b.disabled = true));
      const result = checkAnswer(given, answerOf(card));
      finishAnswer(card, result !== "wrong", { given, almost: result === "almost" });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!input.value.trim()) return;
      submit(input.value);
    });
    $("[data-dont-know]", root).addEventListener("click", () => submit(""));
  }

  function finishAnswer(card, correct, written = null) {
    const feedback = $(".feedback", root);
    const levelBefore = card.level;
    if (correct) {
      setCardLevel(set.id, card.id, levelBefore + 1);
      feedback.className = "feedback good";
      feedback.innerHTML = written?.almost
        ? html`<strong>Почти!</strong> Засчитано. Правильно: <b>${answerOf(card)}</b>`
        : html`<strong>${["Отлично!", "Верно!", "Так держать!", "Правильно!"][Math.floor(Math.random() * 4)]}</strong>`;
    } else {
      setCardLevel(set.id, card.id, 0);
      // Неверный ответ — карточка вернётся в конце раунда.
      queue.push(card);
      feedback.className = "feedback bad";
      feedback.innerHTML = html`
        <div><strong>${written && !written.given ? "Ничего страшного, запомните:" : "Пока не совсем так."}</strong></div>
        ${written?.given ? html`<div class="muted">Ваш ответ: <s>${written.given}</s></div>` : ""}
        <div>Правильный ответ: <b>${answerOf(card)}</b></div>
        ${written?.given
          ? html`<button type="button" class="btn btn-ghost btn-sm" data-override>Я ответил(а) правильно</button>`
          : ""}
      `;
      $("[data-override]", feedback)?.addEventListener("click", () => {
        queue.splice(queue.lastIndexOf(card), 1);
        setCardLevel(set.id, card.id, levelBefore + 1);
        nextQuestion();
      });
    }

    pendingContinue = nextQuestion;
    if (correct && !written?.almost) {
      advanceTimer = setTimeout(nextQuestion, AUTO_ADVANCE_MS);
    } else {
      feedback.insertAdjacentHTML(
        "beforeend",
        html`<div class="continue-row">
          <span class="muted small">Нажмите Enter</span>
          <button type="button" class="btn btn-primary" data-continue>Продолжить</button>
        </div>`.value
      );
      const button = $("[data-continue]", feedback);
      button.addEventListener("click", nextQuestion);
      button.focus();
    }
  }

  function drawRoundSummary() {
    root.innerHTML = html`
      ${modeHeader(set, "Заучивание")}
      ${progressBar()}
      <div class="result-card">
        <h2>Раунд ${roundNumber} завершён</h2>
        <p class="muted">Продолжайте в том же духе — осталось совсем немного.</p>
        <ul class="round-list">
          ${roundCards.map(
            (card) => html`
              <li>
                <span class="round-term">${promptOf(card)}</span>
                <span class="round-def muted">${answerOf(card)}</span>
                <span class="badge ${card.level >= MASTERED ? "badge-good" : "badge-mid"}">${levelLabel(card.level)}</span>
              </li>
            `
          )}
        </ul>
        <button type="button" class="btn btn-primary btn-lg" data-next-round>Продолжить</button>
      </div>
    `;
    bindModeHeader(root, start);
    pendingContinue = nextRound;
    const button = $("[data-next-round]", root);
    button.addEventListener("click", nextRound);
    button.focus();
  }

  function drawFinished() {
    pendingContinue = null;
    root.innerHTML = html`
      ${modeHeader(set, "Заучивание")}
      ${progressBar()}
      <div class="result-card">
        <div class="result-emoji">🏆</div>
        <h2>Поздравляем! Вы выучили все ${cards.length} ${plural(cards.length, ["термин", "термина", "терминов"])}.</h2>
        <div class="result-actions">
          <a class="btn btn-primary" href="#/set/${set.id}/test">Пройти тест</a>
          <button type="button" class="btn btn-secondary" data-reset>Начать заново</button>
        </div>
      </div>
    `;
    bindModeHeader(root, start);
    $("[data-reset]", root).addEventListener("click", () => {
      resetProgress(set.id);
      start();
    });
  }

  function onKeydown(event) {
    if (event.key === "Enter" && pendingContinue) {
      // Кнопки сами обрабатывают Enter через click — не дублируем.
      if (event.target.closest("button")) return;
      event.preventDefault();
      pendingContinue();
      return;
    }
    if (/^[1-9]$/.test(event.key) && !event.target.closest("input, textarea, select")) {
      $(`[data-choice="${Number(event.key) - 1}"]`, root)?.click();
    }
  }

  document.addEventListener("keydown", onKeydown);
  start();
  return () => {
    clearTimeout(advanceTimer);
    document.removeEventListener("keydown", onKeydown);
  };
}
