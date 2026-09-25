import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkAnswer,
  normalizeAnswer,
  parseImport,
  plural,
  shuffle,
  escapeHtml,
  formatTime,
} from "../js/utils.js";

test("normalizeAnswer убирает регистр, ё, пунктуацию и лишние пробелы", () => {
  assert.equal(normalizeAnswer("  Ёлка,  зелёная! "), "елка зеленая");
});

test("checkAnswer: точное совпадение и варианты через запятую/слэш", () => {
  assert.equal(checkAnswer("Париж", "Париж"), "correct");
  assert.equal(checkAnswer("сказать", "говорить, сказать"), "correct");
  assert.equal(checkAnswer("говорить", "говорить / сказать"), "correct");
  assert.equal(checkAnswer("говорить, сказать", "говорить, сказать"), "correct");
});

test("checkAnswer: опечатка засчитывается как almost, короткие слова — нет", () => {
  assert.equal(checkAnswer("Хельсинкк", "Хельсинки"), "almost");
  assert.equal(checkAnswer("кот", "кит"), "wrong");
  assert.equal(checkAnswer("", "что-то"), "wrong");
  assert.equal(checkAnswer("совсем другое", "Лиссабон"), "wrong");
});

test("parseImport: табуляция и новые строки по умолчанию", () => {
  assert.deepEqual(parseImport("cat\tкот\n\ndog\tсобака\n"), [
    { term: "cat", definition: "кот" },
    { term: "dog", definition: "собака" },
  ]);
});

test("parseImport: свои разделители и строки без определения", () => {
  assert.deepEqual(parseImport("a - б; в - г, д; одинокий", " - ", ";"), [
    { term: "a", definition: "б" },
    { term: "в", definition: "г, д" },
    { term: "одинокий", definition: "" },
  ]);
  assert.deepEqual(parseImport("a,1\nb\n\nc,3", ",", /\n\s*\n/), [
    { term: "a", definition: "1\nb" },
    { term: "c", definition: "3" },
  ]);
});

test("plural склоняет по-русски", () => {
  const forms = ["термин", "термина", "терминов"];
  assert.equal(plural(1, forms), "термин");
  assert.equal(plural(3, forms), "термина");
  assert.equal(plural(11, forms), "терминов");
  assert.equal(plural(22, forms), "термина");
  assert.equal(plural(25, forms), "терминов");
});

test("shuffle не теряет элементы и не меняет исходный массив", () => {
  const input = [1, 2, 3, 4, 5];
  const output = shuffle(input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual(output.slice().sort(), input);
});

test("escapeHtml экранирует спецсимволы", () => {
  assert.equal(escapeHtml(`<b a="1">'&'</b>`), "&lt;b a=&quot;1&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;");
});

test("formatTime", () => {
  assert.equal(formatTime(12345), "12.3 с");
  assert.equal(formatTime(65400), "1:05.4");
});
