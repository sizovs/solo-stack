import { describe, it, before } from "node:test";
import assert from "node:assert";
import { fs } from "memfs";
import { Hasher } from "./hasher.js";

let hasher;
before(() => {
  const cwd = process.cwd();
  fs.mkdirSync(`${cwd}/static/nest`, { recursive: true });
  fs.writeFileSync(`${cwd}/static/a.css`, `aaaaaaaaaaaaa`);
  fs.writeFileSync(`${cwd}/static/b.css`, `bbbbbbbbbbbbb`);
  fs.writeFileSync(`${cwd}/static/nest/n.css`, `nnnnnnnnnnnnn`);
  hasher = new Hasher({
    filesystem: fs,
  });
});

describe("hasher", async () => {
  it("hashes static assets", () => {
    assert.strictEqual(
      hasher.hashed("/static/b.css"),
      "/static/b.css?v=1efc98f0",
    );
    assert.strictEqual(
      hasher.hashed("/static/a.css"),
      "/static/a.css?v=c162de19",
    );
    assert.strictEqual(
      hasher.hashed("/static/nest/n.css"),
      "/static/nest/n.css?v=83a8818d",
    );
    assert.strictEqual(
      hasher.hashed("/static/missing.css"),
      "/static/missing.css",
    );
  });
});
