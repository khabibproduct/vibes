// Чистые вспомогательные функции без зависимостей от DOM — их можно тестировать в Node.

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function shuffle(array, random = Math.random) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sample(array, count, random = Math.random) {
  return shuffle(array, random).slice(0, count);
}

// Приводит ответ к виду, удобному для сравнения: регистр, ё/е, пунктуация, лишние пробелы.
export function normalizeAnswer(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

// Результат проверки письменного ответа: "correct", "almost" (опечатка) или "wrong".
// Ответ вида "кот, кошка" или "кот / кошка" принимает любой из вариантов.
export function checkAnswer(given, expected) {
  const answer = normalizeAnswer(given);
  if (!answer) return "wrong";
  const variants = [expected, ...String(expected).split(/[,;/]/)]
    .map(normalizeAnswer)
    .filter(Boolean);
  if (variants.includes(answer)) return "correct";
  const closeEnough = variants.some((variant) => {
    const allowed = variant.length >= 8 ? 2 : variant.length >= 4 ? 1 : 0;
    return allowed > 0 && levenshtein(answer, variant) <= allowed;
  });
  return closeEnough ? "almost" : "wrong";
}

// Разбирает текст для импорта: одна карточка на строку (или на блок, если выбран
// другой разделитель карточек), термин и определение разделены termSep.
export function parseImport(text, termSep = "\t", cardSep = "\n") {
  return String(text ?? "")
    .split(cardSep)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const index = chunk.indexOf(termSep);
      if (index === -1) return { term: chunk, definition: "" };
      return {
        term: chunk.slice(0, index).trim(),
        definition: chunk.slice(index + termSep.length).trim(),
      };
    })
    .filter((card) => card.term || card.definition);
}

export function formatTime(ms) {
  const totalTenths = Math.floor(ms / 100);
  const seconds = Math.floor(totalTenths / 10);
  const tenths = totalTenths % 10;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0
    ? `${minutes}:${String(rest).padStart(2, "0")}.${tenths}`
    : `${rest}.${tenths} с`;
}

// Склонение: plural(5, ["термин", "термина", "терминов"]) → "терминов".
export function plural(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
