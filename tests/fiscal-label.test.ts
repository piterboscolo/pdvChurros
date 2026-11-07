import assert from "node:assert/strict";
import test from "node:test";
import { fiscalLabel } from "../backend/src/lib/fiscalLabel";

test("fiscal sem configuração aparece desligado", () => {
  assert.equal(fiscalLabel(null), "Desligado");
  assert.equal(fiscalLabel("HOMOLOGATION"), "Homologação");
  assert.equal(fiscalLabel("PRODUCTION"), "Produção");
});
