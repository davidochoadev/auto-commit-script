import { describe, it } from "node:test";
import assert from "node:assert";
import { getArgs, COMMIT_TYPES, DEFAULT_MESSAGE } from "./commit.js";

describe("getArgs", () => {
  it("restituisce help: true se primo argomento è --help", () => {
    assert.deepStrictEqual(getArgs(["--help"]), { help: true });
  });

  it("restituisce help: true se primo argomento è -h", () => {
    assert.deepStrictEqual(getArgs(["-h"]), { help: true });
  });

  it("nessun argomento: type undefined, message default", () => {
    const out = getArgs([]);
    assert.strictEqual(out.type, undefined);
    assert.strictEqual(out.message, DEFAULT_MESSAGE);
    assert.strictEqual(out.noPush, false);
    assert.strictEqual(out.branchName, "main");
  });

  it("solo tipo: message default", () => {
    const out = getArgs(["fix"]);
    assert.strictEqual(out.type, "fix");
    assert.strictEqual(out.message, DEFAULT_MESSAGE);
  });

  it("tipo e messaggio", () => {
    const out = getArgs(["feat", "nuova funzionalità"]);
    assert.strictEqual(out.type, "feat");
    assert.strictEqual(out.message, "nuova funzionalità");
  });

  it("tipo, messaggio multiplo e --no-push", () => {
    const out = getArgs(["fix", "corretto bug", "nel login", "--no-push"]);
    assert.strictEqual(out.type, "fix");
    assert.strictEqual(out.message, "corretto bug nel login");
    assert.strictEqual(out.noPush, true);
  });

  it("-n imposta noPush", () => {
    const out = getArgs(["refactoring", "semplificato", "-n"]);
    assert.strictEqual(out.noPush, true);
  });

  it("--branch nome estrae branch per first", () => {
    const out = getArgs(["first", "https://github.com/u/r.git", "--branch", "develop"]);
    assert.strictEqual(out.branchName, "develop");
  });

  it("branchName default main se --branch assente", () => {
    const out = getArgs(["feat", "x"]);
    assert.strictEqual(out.branchName, "main");
  });
});

describe("COMMIT_TYPES / tipo -> config", () => {
  it("fix mappa al config fix", () => {
    const config = COMMIT_TYPES.fix;
    assert.strictEqual(config.label, "fix");
    assert.strictEqual(config.prefix, "Fix");
  });

  it("feat mappa al config feat", () => {
    const config = COMMIT_TYPES.feat;
    assert.strictEqual(config.label, "feat");
  });

  it("refactoring mappa al config refactoring", () => {
    const config = COMMIT_TYPES.refactoring;
    assert.strictEqual(config.label, "refactoring");
  });

  it("first mappa al config first", () => {
    const config = COMMIT_TYPES.first;
    assert.strictEqual(config.label, "first");
  });

  it("tipo sconosciuto usa default", () => {
    const config = COMMIT_TYPES.xyz || COMMIT_TYPES.default;
    assert.strictEqual(config, COMMIT_TYPES.default);
    assert.strictEqual(config.label, "commit");
  });

  it("undefined type usa default", () => {
    const config = COMMIT_TYPES[undefined] || COMMIT_TYPES.default;
    assert.strictEqual(config.label, "commit");
  });
});
