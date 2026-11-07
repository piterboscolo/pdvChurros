import assert from "node:assert/strict";
import test from "node:test";
import { lineTotalCents, parseCents } from "../shared/types/money";

test("total da linha em centavos", () => {
  assert.equal(lineTotalCents(1050, 2), 2100);
  assert.equal(lineTotalCents(0, 3), 0);
});

test("leitura de valor digitado", () => {
  assert.equal(parseCents("10,50"), 1050);
  assert.equal(parseCents("1.234,56"), 123456);
  assert.equal(parseCents("10,5"), 1050);
  assert.equal(parseCents(""), null);
  assert.equal(parseCents("abc"), null);
});
