import { test } from "node:test";
import assert from "node:assert/strict";
import { buildChoices, pickRound, buildTest } from "../js/quiz.js";

function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const cards = [
  { id: "1", term: "Франция", definition: "Париж", level: 0 },
  { id: "2", term: "Германия", definition: "Берлин", level: 1 },
  { id: "3", term: "Италия", definition: "Рим", level: 2 },
  { id: "4", term: "Испания", definition: "Мадрид", level: 0 },
  { id: "5", term: "Австрия", definition: "Вена", level: 1 },
];

test("buildChoices: правильный ответ присутствует, варианты уникальны", () => {
  const pool = ["Париж", "Берлин", "Рим", "Мадрид", "париж", "Вена"];
  for (let seed = 1; seed < 20; seed++) {
    const choices = buildChoices("Париж", pool, 4, seeded(seed));
    assert.equal(choices.length, 4);
    assert.ok(choices.includes("Париж"));
    assert.equal(new Set(choices.map((c) => c.toLowerCase())).size, 4);
  }
});

test("buildChoices: при малом пуле вариантов меньше", () => {
  assert.deepEqual(buildChoices("a", ["a"], 4).length, 1);
  assert.equal(buildChoices("a", ["a", "b"], 4).length, 2);
});

test("pickRound: без выученных, сначала наименее изученные", () => {
  const round = pickRound(cards, 2, 3, seeded(3));
  assert.equal(round.length, 3);
  assert.ok(round.every((card) => card.level < 2));
  assert.deepEqual(round.slice(0, 2).map((c) => c.level), [0, 0]);
  assert.equal(pickRound(cards.filter((c) => c.level === 2), 2).length, 0);
});

test("buildTest: нужное число вопросов и корректные поля", () => {
  const questions = buildTest(cards, {
    count: 5,
    types: ["truefalse", "choice", "written"],
    getPrompt: (c) => c.term,
    getAnswer: (c) => c.definition,
    random: seeded(7),
  });
  assert.equal(questions.length, 5);
  assert.equal(new Set(questions.map((q) => q.card.id)).size, 5);
  for (const q of questions) {
    assert.equal(q.answer, q.card.definition);
    if (q.type === "choice") assert.ok(q.choices.includes(q.answer));
    if (q.type === "truefalse") assert.equal(q.shown === q.answer, q.isTrue);
  }
  const types = new Set(questions.map((q) => q.type));
  assert.equal(types.size, 3);
});

test("buildTest: не больше карточек, чем есть, и пусто без типов", () => {
  const opts = { getPrompt: (c) => c.term, getAnswer: (c) => c.definition };
  assert.equal(buildTest(cards, { ...opts, count: 50, types: ["written"] }).length, 5);
  assert.equal(buildTest(cards, { ...opts, count: 5, types: [] }).length, 0);
});
