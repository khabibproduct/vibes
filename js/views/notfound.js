import { html } from "../dom.js";

export function renderNotFound(root) {
  root.innerHTML = html`
    <div class="empty-state">
      <div class="empty-emoji">🤔</div>
      <h1>Страница не найдена</h1>
      <p>Возможно, набор был удалён.</p>
      <a class="btn btn-primary" href="#/">На главную</a>
    </div>
  `;
}
