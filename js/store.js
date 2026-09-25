import { uid } from "./utils.js";

const STORAGE_KEY = "vibes-cards:v1";

// Прогресс по карточке в режиме «Заучивание»:
// 0 — не изучена, 1 — узнаёт в тесте, 2 — пишет по памяти (выучена).
export const MASTERED = 2;

const SAMPLE_SETS = [
  {
    title: "Английский: базовые глаголы",
    description: "Самые частые глаголы английского языка",
    cards: [
      ["to be", "быть"],
      ["to have", "иметь"],
      ["to do", "делать"],
      ["to say", "говорить, сказать"],
      ["to go", "идти, ехать"],
      ["to get", "получать"],
      ["to make", "создавать, изготавливать"],
      ["to know", "знать"],
      ["to think", "думать"],
      ["to take", "брать"],
      ["to see", "видеть"],
      ["to come", "приходить"],
    ],
  },
  {
    title: "Столицы Европы",
    description: "Страна — столица",
    cards: [
      ["Франция", "Париж"],
      ["Германия", "Берлин"],
      ["Италия", "Рим"],
      ["Испания", "Мадрид"],
      ["Португалия", "Лиссабон"],
      ["Австрия", "Вена"],
      ["Чехия", "Прага"],
      ["Польша", "Варшава"],
      ["Норвегия", "Осло"],
      ["Финляндия", "Хельсинки"],
    ],
  },
];

function makeCard(term = "", definition = "") {
  return { id: uid(), term, definition, starred: false, level: 0 };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Повреждённые данные или недоступное хранилище — начинаем с примеров.
  }
  const now = Date.now();
  return {
    sets: SAMPLE_SETS.map((set, i) => ({
      id: uid(),
      title: set.title,
      description: set.description,
      createdAt: now - i,
      updatedAt: now - i,
      studiedAt: null,
      cards: set.cards.map(([term, definition]) => makeCard(term, definition)),
    })),
  };
}

let state = load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Хранилище переполнено или запрещено — данные останутся только до перезагрузки.
  }
}

export function listSets() {
  return state.sets
    .slice()
    .sort((a, b) => (b.studiedAt ?? b.updatedAt) - (a.studiedAt ?? a.updatedAt));
}

export function getSet(id) {
  return state.sets.find((set) => set.id === id) ?? null;
}

// Сохраняет набор из редактора. Прогресс и «звёздочки» сохраняются для карточек,
// которые остались, а у изменённых карточек прогресс сбрасывается.
export function saveSet({ id, title, description, cards }) {
  const now = Date.now();
  const existing = id ? getSet(id) : null;
  const previous = new Map((existing?.cards ?? []).map((card) => [card.id, card]));
  const nextCards = cards.map((card) => {
    const old = previous.get(card.id);
    if (!old) return makeCard(card.term, card.definition);
    const changed = old.term !== card.term || old.definition !== card.definition;
    return { ...old, term: card.term, definition: card.definition, level: changed ? 0 : old.level };
  });
  if (existing) {
    Object.assign(existing, { title, description, cards: nextCards, updatedAt: now });
    save();
    return existing;
  }
  const set = {
    id: uid(),
    title,
    description,
    createdAt: now,
    updatedAt: now,
    studiedAt: null,
    cards: nextCards,
  };
  state.sets.push(set);
  save();
  return set;
}

export function deleteSet(id) {
  state.sets = state.sets.filter((set) => set.id !== id);
  save();
}

export function toggleStar(setId, cardId) {
  const card = getSet(setId)?.cards.find((c) => c.id === cardId);
  if (!card) return false;
  card.starred = !card.starred;
  save();
  return card.starred;
}

export function setCardLevel(setId, cardId, level) {
  const card = getSet(setId)?.cards.find((c) => c.id === cardId);
  if (!card) return;
  card.level = Math.max(0, Math.min(MASTERED, level));
  save();
}

export function resetProgress(setId) {
  const set = getSet(setId);
  if (!set) return;
  set.cards.forEach((card) => (card.level = 0));
  save();
}

export function markStudied(setId) {
  const set = getSet(setId);
  if (!set) return;
  set.studiedAt = Date.now();
  save();
}

export function getBestMatchTime(setId) {
  return getSet(setId)?.bestMatchMs ?? null;
}

// Возвращает true, если это новый рекорд.
export function recordMatchTime(setId, ms) {
  const set = getSet(setId);
  if (!set) return false;
  const isRecord = set.bestMatchMs == null || ms < set.bestMatchMs;
  if (isRecord) {
    set.bestMatchMs = ms;
    save();
  }
  return isRecord;
}

export function getSettings() {
  return state.settings ?? {};
}

export function updateSettings(patch) {
  state.settings = { ...getSettings(), ...patch };
  save();
}
