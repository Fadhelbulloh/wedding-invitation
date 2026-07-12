import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

test("getGuest resolves known token, null for unknown", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "guests-"));
  await writeFile(path.join(dir, "guests.json"), JSON.stringify({ abc123: "Budi & Family" }));
  process.env.DATA_DIR = dir;
  const { getGuest } = await import("./guests.ts");
  assert.equal(await getGuest("abc123"), "Budi & Family");
  assert.equal(await getGuest("nope"), null);
});
