import { renderHome } from "./views/home.js";
import { renderSet } from "./views/set.js";
import { renderEditor } from "./views/editor.js";
import { renderFlashcards } from "./views/flashcards.js";
import { renderLearn } from "./views/learn.js";
import { renderTest } from "./views/test.js";
import { renderMatch } from "./views/match.js";
import { renderNotFound } from "./views/notfound.js";
import { getSet } from "./store.js";

const routes = [
  { pattern: /^\/?$/, view: renderHome },
  { pattern: /^\/new$/, view: renderEditor },
  { pattern: /^\/set\/([\w-]+)$/, view: renderSet, needsSet: true },
  { pattern: /^\/set\/([\w-]+)\/edit$/, view: renderEditor, needsSet: true },
  { pattern: /^\/set\/([\w-]+)\/cards$/, view: renderFlashcards, needsSet: true },
  { pattern: /^\/set\/([\w-]+)\/learn$/, view: renderLearn, needsSet: true },
  { pattern: /^\/set\/([\w-]+)\/test$/, view: renderTest, needsSet: true },
  { pattern: /^\/set\/([\w-]+)\/match$/, view: renderMatch, needsSet: true },
];

const root = document.getElementById("app");
let cleanup = null;

function route() {
  const path = decodeURIComponent(location.hash.replace(/^#/, "")) || "/";
  cleanup?.();
  cleanup = null;
  window.speechSynthesis?.cancel();
  root.innerHTML = "";
  window.scrollTo(0, 0);

  for (const { pattern, view, needsSet } of routes) {
    const match = path.match(pattern);
    if (!match) continue;
    const set = match[1] ? getSet(match[1]) : null;
    if (needsSet && !set) break;
    // Вид может вернуть функцию очистки (снять обработчики клавиш, таймеры).
    cleanup = view(root, { set }) ?? null;
    return;
  }
  cleanup = renderNotFound(root) ?? null;
}

window.addEventListener("hashchange", route);
route();
