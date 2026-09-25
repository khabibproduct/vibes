// Генерация вопросов для режимов «Заучивание» и «Тест». Без DOM и хранилища.
import { shuffle, normalizeAnswer } from "./utils.js";

// Варианты ответа: правильный + до (count - 1) неповторяющихся неправильных.
export function buildChoices(correct, pool, count = 4, random = Math.random) {
  const seen = new Set([normalizeAnswer(correct)]);
  const distractors = [];
  for (const option of shuffle(pool, random)) {
    const key = normalizeAnswer(option);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(option);
    if (distractors.length === count - 1) break;
  }
  return shuffle([correct, ...distractors], random);
}

// Карточки для следующего раунда: сначала наименее изученные, внутри уровня — случайно.
export function pickRound(cards, masteredLevel, size = 7, random = Math.random) {
  return shuffle(cards.filter((card) => card.level < masteredLevel), random)
    .sort((a, b) => a.level - b.level)
    .slice(0, size);
}

export const TEST_TYPES = ["truefalse", "choice", "written"];

// Составляет тест. getPrompt/getAnswer определяют направление (термин → определение или наоборот).
export function buildTest(cards, { count, types, getPrompt, getAnswer, random = Math.random }) {
  const enabled = TEST_TYPES.filter((type) => types.includes(type));
  if (!enabled.length) return [];
  const picked = shuffle(cards, random).slice(0, Math.min(count, cards.length));
  const allAnswers = cards.map(getAnswer);
  // Типы раздаём поровну, затем перемешиваем, чтобы они не шли блоками по порядку.
  const assignedTypes = shuffle(
    picked.map((_, i) => enabled[i % enabled.length]),
    random
  );

  return picked.map((card, i) => {
    const type = assignedTypes[i];
    const question = { type, card, prompt: getPrompt(card), answer: getAnswer(card) };
    if (type === "choice") {
      question.choices = buildChoices(question.answer, allAnswers, 4, random);
    } else if (type === "truefalse") {
      const others = allAnswers.filter(
        (answer) => normalizeAnswer(answer) !== normalizeAnswer(question.answer)
      );
      question.isTrue = !others.length || random() < 0.5;
      question.shown = question.isTrue
        ? question.answer
        : others[Math.floor(random() * others.length)];
    }
    return question;
  });
}
