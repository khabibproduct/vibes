import { html, $, $$, icons, toast } from "../dom.js";
import { saveSet } from "../store.js";
import { parseImport } from "../utils.js";

const TERM_SEPARATORS = { tab: "\t", comma: ",", dash: " - ", semicolon: ";" };
const CARD_SEPARATORS = { newline: "\n", semicolon: ";", blank: /\n\s*\n/ };

function cardRow(card, index) {
  return html`
    <li class="card-editor" data-id="${card.id ?? ""}">
      <div class="card-editor-head">
        <span class="card-index">${index + 1}</span>
        <button type="button" class="icon-btn" data-remove aria-label="Удалить карточку">${icons.trash}</button>
      </div>
      <div class="card-editor-fields">
        <label class="field">
          <textarea class="input" rows="1" data-term placeholder="Введите термин">${card.term}</textarea>
          <span class="field-label">Термин</span>
        </label>
        <label class="field">
          <textarea class="input" rows="1" data-definition placeholder="Введите определение">${card.definition}</textarea>
          <span class="field-label">Определение</span>
        </label>
      </div>
    </li>
  `;
}

function autosize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function renderEditor(root, { set }) {
  const isNew = !set;
  const initialCards = set
    ? set.cards.map((card) => ({ id: card.id, term: card.term, definition: card.definition }))
    : Array.from({ length: 3 }, () => ({ id: "", term: "", definition: "" }));

  root.innerHTML = html`
    <form class="editor" novalidate>
      <div class="page-header">
        <h1>${isNew ? "Новый набор" : "Редактирование набора"}</h1>
        <div class="set-actions">
          ${isNew ? "" : html`<a class="btn btn-ghost" href="#/set/${set.id}">Отмена</a>`}
          <button class="btn btn-primary" type="submit">${isNew ? "Создать" : "Сохранить"}</button>
        </div>
      </div>

      <label class="field">
        <input class="input input-lg" name="title" placeholder="Например: «Английский — неправильные глаголы»"
          value="${set?.title ?? ""}" required />
        <span class="field-label">Название</span>
      </label>
      <label class="field">
        <textarea class="input" name="description" rows="2" placeholder="Добавьте описание…">${set?.description ?? ""}</textarea>
        <span class="field-label">Описание</span>
      </label>

      <div class="editor-toolbar">
        <button type="button" class="btn btn-secondary btn-sm" data-toggle-import>+ Импорт</button>
        <button type="button" class="btn btn-secondary btn-sm" data-swap>⇄ Поменять термины и определения</button>
      </div>

      <section class="panel import-panel" hidden>
        <h2>Импорт данных</h2>
        <p class="muted small">Скопируйте и вставьте данные из Word, Excel, Google Таблиц и т. п.</p>
        <textarea class="input mono" rows="6" data-import-text
          placeholder="Слово 1&#9;Определение 1&#10;Слово 2&#9;Определение 2"></textarea>
        <div class="import-options">
          <fieldset>
            <legend>Между термином и определением</legend>
            <label><input type="radio" name="termSep" value="tab" checked /> Tab</label>
            <label><input type="radio" name="termSep" value="comma" /> Запятая</label>
            <label><input type="radio" name="termSep" value="dash" /> Тире ( - )</label>
            <label><input type="radio" name="termSep" value="semicolon" /> Точка с запятой</label>
          </fieldset>
          <fieldset>
            <legend>Между карточками</legend>
            <label><input type="radio" name="cardSep" value="newline" checked /> Новая строка</label>
            <label><input type="radio" name="cardSep" value="semicolon" /> Точка с запятой</label>
            <label><input type="radio" name="cardSep" value="blank" /> Пустая строка</label>
          </fieldset>
        </div>
        <p class="muted small" data-import-preview></p>
        <button type="button" class="btn btn-primary btn-sm" data-import>Импортировать</button>
      </section>

      <ol class="card-editor-list">${initialCards.map(cardRow)}</ol>

      <button type="button" class="add-card" data-add>+ Добавить карточку</button>

      <div class="editor-footer">
        <button class="btn btn-primary btn-lg" type="submit">${isNew ? "Создать" : "Сохранить"}</button>
      </div>
    </form>
  `;

  const form = $("form", root);
  const fields = form.elements;
  const list = $(".card-editor-list", root);
  const importPanel = $(".import-panel", root);
  const importText = $("[data-import-text]", root);
  const importPreview = $("[data-import-preview]", root);

  function renumber() {
    $$(".card-editor", list).forEach((row, i) => {
      $(".card-index", row).textContent = i + 1;
    });
  }

  function appendCards(cards) {
    const start = list.children.length;
    list.insertAdjacentHTML("beforeend", cards.map((card, i) => cardRow(card, start + i)).join(""));
    $$("textarea", list).forEach(autosize);
    return list.lastElementChild;
  }

  function readCards() {
    return $$(".card-editor", list).map((row) => ({
      id: row.dataset.id,
      term: $("[data-term]", row).value.trim(),
      definition: $("[data-definition]", row).value.trim(),
    }));
  }

  function parsedImport() {
    const termSep = TERM_SEPARATORS[fields.termSep.value];
    const cardSep = CARD_SEPARATORS[fields.cardSep.value];
    return parseImport(importText.value, termSep, cardSep);
  }

  $$("textarea", root).forEach(autosize);
  form.addEventListener("input", (event) => {
    if (event.target.tagName === "TEXTAREA") autosize(event.target);
    if (importPanel.contains(event.target)) {
      const count = parsedImport().length;
      importPreview.textContent = count ? `Будет добавлено карточек: ${count}` : "";
    }
  });

  list.addEventListener("click", (event) => {
    if (!event.target.closest("[data-remove]")) return;
    const row = event.target.closest(".card-editor");
    if (list.children.length <= 2) {
      toast("В наборе должно быть минимум две карточки");
      return;
    }
    row.remove();
    renumber();
  });

  // Tab в последнем определении добавляет новую карточку — как в Quizlet.
  list.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || event.shiftKey) return;
    const row = event.target.closest(".card-editor");
    if (!event.target.matches("[data-definition]") || row !== list.lastElementChild) return;
    event.preventDefault();
    $("[data-term]", appendCards([{ id: "", term: "", definition: "" }])).focus();
  });

  $("[data-add]", root).addEventListener("click", () => {
    const row = appendCards([{ id: "", term: "", definition: "" }]);
    $("[data-term]", row).focus();
  });

  $("[data-toggle-import]", root).addEventListener("click", () => {
    importPanel.hidden = !importPanel.hidden;
    if (!importPanel.hidden) importText.focus();
  });

  $("[data-swap]", root).addEventListener("click", () => {
    $$(".card-editor", list).forEach((row) => {
      const term = $("[data-term]", row);
      const definition = $("[data-definition]", row);
      [term.value, definition.value] = [definition.value, term.value];
      autosize(term);
      autosize(definition);
    });
  });

  $("[data-import]", root).addEventListener("click", () => {
    const cards = parsedImport();
    if (!cards.length) {
      toast("Нечего импортировать");
      return;
    }
    // Пустые строки-заготовки заменяем импортированными карточками.
    $$(".card-editor", list).forEach((row) => {
      if (!$("[data-term]", row).value.trim() && !$("[data-definition]", row).value.trim()) row.remove();
    });
    appendCards(cards.map((card) => ({ id: "", ...card })));
    renumber();
    importText.value = "";
    importPreview.textContent = "";
    importPanel.hidden = true;
    toast(`Добавлено карточек: ${cards.length}`);
  });

  function submit() {
    const title = fields.title.value.trim();
    const cards = readCards().filter((card) => card.term || card.definition);
    if (!title) {
      toast("Введите название набора");
      fields.title.focus();
      return;
    }
    if (cards.length < 2) {
      toast("Добавьте хотя бы две карточки");
      return;
    }
    const saved = saveSet({
      id: set?.id,
      title,
      description: fields.description.value.trim(),
      cards,
    });
    toast(isNew ? "Набор создан" : "Изменения сохранены");
    location.hash = `#/set/${saved.id}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit();
  });

  const onKeydown = (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  };
  document.addEventListener("keydown", onKeydown);

  if (isNew) fields.title.focus();
  return () => document.removeEventListener("keydown", onKeydown);
}
