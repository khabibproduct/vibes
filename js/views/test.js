import { html, $, $$ } from "../dom.js";
import { markStudied, getSettings, updateSettings } from "../store.js";
import { studyCards, promptOf, answerOf, modeHeader, bindModeHeader } from "../study.js";
import { buildTest, TEST_TYPES } from "../quiz.js";
import { checkAnswer } from "../utils.js";

const TYPE_LABELS = {
  truefalse: "Верно / неверно",
  choice: "Выбор ответа",
  written: "Письменный ответ",
};

export function renderTest(root, { set }) {
  let questions = [];

  function drawSetup() {
    const cards = studyCards(set);
    const saved = getSettings().test ?? {};
    const types = saved.types?.length ? saved.types : TEST_TYPES;
    const count = Math.min(saved.count ?? 20, cards.length);

    root.innerHTML = html`
      ${modeHeader(set, "Тест")}
      <form class="panel test-setup">
        <h2>Настройте тест</h2>
        <label class="setup-row">
          Количество вопросов (макс. ${cards.length})
          <input class="input input-num" type="number" name="count" min="1" max="${cards.length}" value="${count}" />
        </label>
        <fieldset class="setup-types">
          <legend>Типы вопросов</legend>
          ${TEST_TYPES.map(
            (type) => html`
              <label class="checkbox">
                <input type="checkbox" name="types" value="${type}" ${types.includes(type) ? "checked" : ""} />
                ${TYPE_LABELS[type]}
              </label>
            `
          )}
        </fieldset>
        <p class="form-error" hidden></p>
        <button type="submit" class="btn btn-primary btn-lg">Начать тест</button>
      </form>
    `;
    bindModeHeader(root, drawSetup);

    const form = $("form", root);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const chosenTypes = $$('input[name="types"]:checked', form).map((input) => input.value);
      const chosenCount = Math.max(1, Math.min(cards.length, Number(form.elements.count.value) || 1));
      if (!chosenTypes.length) {
        const error = $(".form-error", form);
        error.textContent = "Выберите хотя бы один тип вопросов";
        error.hidden = false;
        return;
      }
      updateSettings({ test: { types: chosenTypes, count: chosenCount } });
      questions = buildTest(cards, {
        count: chosenCount,
        types: chosenTypes,
        getPrompt: (card) => promptOf(card),
        getAnswer: (card) => answerOf(card),
      });
      markStudied(set.id);
      drawTest();
    });
  }

  function questionBody(question, i) {
    const name = `q${i}`;
    if (question.type === "written") {
      return html`
        <input class="input" name="${name}" autocomplete="off" placeholder="Введите ответ" aria-label="Ваш ответ" />
      `;
    }
    if (question.type === "truefalse") {
      return html`
        <div class="tf-shown"><span class="muted small">Ответ:</span> ${question.shown}</div>
        <div class="choices choices-inline">
          <label class="choice"><input type="radio" name="${name}" value="true" /> Верно</label>
          <label class="choice"><input type="radio" name="${name}" value="false" /> Неверно</label>
        </div>
      `;
    }
    return html`
      <div class="choices">
        ${question.choices.map(
          (choice, c) => html`
            <label class="choice"><input type="radio" name="${name}" value="${c}" /> ${choice}</label>
          `
        )}
      </div>
    `;
  }

  function drawTest() {
    root.innerHTML = html`
      ${modeHeader(set, "Тест")}
      <form class="test-form" autocomplete="off">
        ${questions.map(
          (question, i) => html`
            <section class="question-card" data-question="${i}">
              <div class="question-top">
                <span class="muted small">${TYPE_LABELS[question.type]}</span>
                <span class="muted small">${i + 1} из ${questions.length}</span>
              </div>
              <div class="question-prompt">${question.prompt}</div>
              ${questionBody(question, i)}
              <div class="feedback"></div>
            </section>
          `
        )}
        <div class="center">
          <button type="submit" class="btn btn-primary btn-lg">Отправить ответы</button>
        </div>
      </form>
    `;
    bindModeHeader(root, drawSetup);
    const form = $(".test-form", root);
    $("input", form)?.focus();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      grade(form);
    });
  }

  function grade(form) {
    let score = 0;
    questions.forEach((question, i) => {
      const section = $(`[data-question="${i}"]`, form);
      const feedback = $(".feedback", section);
      const input = form.elements[`q${i}`];
      let correct = false;
      let note = "";

      if (question.type === "written") {
        const result = checkAnswer(input.value, question.answer);
        correct = result !== "wrong";
        if (result === "almost") note = "С опечаткой, но засчитано.";
      } else if (question.type === "truefalse") {
        correct = input.value !== "" && (input.value === "true") === question.isTrue;
      } else {
        correct = input.value !== "" && question.choices[Number(input.value)] === question.answer;
      }

      if (correct) score++;
      section.classList.add(correct ? "is-correct" : "is-wrong");
      feedback.className = `feedback ${correct ? "good" : "bad"}`;
      feedback.innerHTML = correct
        ? html`<strong>Верно.</strong> ${note}`
        : html`<strong>Неверно.</strong> Правильный ответ: <b>${question.answer}</b>`;
    });

    $$("input", form).forEach((input) => (input.disabled = true));
    const percent = Math.round((score / questions.length) * 100);
    const summary = document.createElement("div");
    summary.className = "result-card";
    summary.innerHTML = html`
      <div class="score-ring" style="--percent: ${percent}">
        <span>${percent}%</span>
      </div>
      <h2>${percent >= 90 ? "Превосходно!" : percent >= 60 ? "Неплохо!" : "Есть над чем поработать"}</h2>
      <p class="muted">Правильных ответов: ${score} из ${questions.length}</p>
      <div class="result-actions">
        <button type="button" class="btn btn-primary" data-new-test>Новый тест</button>
        <a class="btn btn-secondary" href="#/set/${set.id}/learn">Заучивание</a>
      </div>
    `;
    $(".test-form .center", root).replaceWith(summary);
    form.prepend(summary.cloneNode(true));
    $$("[data-new-test]", root).forEach((button) => button.addEventListener("click", drawSetup));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  drawSetup();
}
