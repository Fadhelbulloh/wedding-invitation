import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { saveRsvp, listRsvps, addMessage, listMessages, setMessageStatus } from "./storage.ts";

async function freshDir() {
  process.env.DATA_DIR = await mkdtemp(path.join(tmpdir(), "store-"));
}

test("saveRsvp: latest per token wins", async () => {
  await freshDir();
  await saveRsvp({ token: "t1", name: "Budi", attending: true, count: 2, note: "" });
  await saveRsvp({ token: "t1", name: "Budi", attending: false, count: 0, note: "sorry" });
  const all = await listRsvps();
  assert.equal(all.length, 1);
  assert.equal(all[0].attending, false);
});

test("messages: pending by default, approve flow, rate limit", async () => {
  await freshDir();
  const m = await addMessage({ token: "t1", name: "Budi", text: "Congrats!" });
  assert.equal(m.status, "pending");
  assert.equal((await listMessages("approved")).length, 0);
  await setMessageStatus(m.id, "approved");
  assert.equal((await listMessages("approved")).length, 1);
  for (let i = 0; i < 4; i++) await addMessage({ token: "t1", name: "B", text: "x" });
  await assert.rejects(addMessage({ token: "t1", name: "B", text: "x" }), /rate_limited/);
});

// Note: storage.ts must read process.env.DATA_DIR at call time (it does — dataDir()
// is a function), so per-test env swaps work without module cache-busting.
