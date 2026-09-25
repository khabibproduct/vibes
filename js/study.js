// Общие настройки режимов обучения: чем отвечать и учить ли только отмеченные карточки.
import { getSettings, updateSettings } from "./store.js";
import { html } from "./dom.js";

export function getAnswerWith() {
  return getSettings().answerWith === "term" ? "term" : "definition";
}

export function setAnswerWith(value) {
  updateSettings({ answerWith: value });
}

export function getStarredOnly() {
  return Boolean(getSettings().starredOnly);
}

export function setStarredOnly(value) {
  updateSettings({ starredOnly: value });
}

// Карточки для занятия: только заполненные, и только отмеченные, если так выбрано.
export function studyCards(set) {
  const complete = set.cards.filter((card) => card.term && card.definition);
  if (!getStarredOnly()) return complete;
  const starred = complete.filter((card) => card.starred);
  return starred.length ? starred : complete;
}

export function promptOf(card, answerWith = getAnswerWith()) {
  return answerWith === "term" ? card.definition : card.term;
}

export function answerOf(card, answerWith = getAnswerWith()) {
  return answerWith === "term" ? card.term : card.definition;
}

export function modeHeader(set, title, { answerSelect = true } = {}) {
  return html`
    <div class="mode-header">
      <a class="btn btn-ghost btn-sm" href="#/set/${set.id}">← ${set.title}</a>
      <h1 class="mode-title">${title}</h1>
      ${answerSelect
        ? html`<label class="select-label">
        Отвечать
        <select data-answer-with>
          <option value="definition" ${getAnswerWith() === "definition" ? "selected" : ""}>определением</option>
          <option value="term" ${getAnswerWith() === "term" ? "selected" : ""}>термином</option>
        </select>
      </label>`
        : html`<span></span>`}
    </div>
  `;
}

// Подключает переключатель «Отвечать …» в шапке режима; onChange перезапускает режим.
export function bindModeHeader(root, onChange) {
  const select = root.querySelector("[data-answer-with]");
  select?.addEventListener("change", () => {
    setAnswerWith(select.value);
    onChange();
  });
}
