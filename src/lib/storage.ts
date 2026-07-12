import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type Rsvp = { token: string; name: string; attending: boolean; count: number; note: string; updatedAt: string };
export type Message = { id: string; token: string; name: string; text: string; status: "pending" | "approved" | "rejected"; createdAt: string };

function dataDir() {
  return process.env.DATA_DIR ?? path.join(process.cwd(), "data");
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir(), file), "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = path.join(dataDir(), `${file}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(value, null, 2));
  await fs.rename(tmp, path.join(dataDir(), file));
}

let lock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const r = lock.then(fn);
  lock = r.catch(() => {});
  return r;
}

// ponytail: single-process file storage, whole-file rewrite per mutation; ceiling ~hundreds of guests, upgrade path SQLite
export async function saveRsvp(r: Omit<Rsvp, "updatedAt">): Promise<void> {
  return withLock(async () => {
    const all = await readJson<Record<string, Rsvp>>("rsvps.json", {});
    all[r.token] = { ...r, updatedAt: new Date().toISOString() };
    await writeJson("rsvps.json", all);
  });
}

export async function listRsvps(): Promise<Rsvp[]> {
  return Object.values(await readJson<Record<string, Rsvp>>("rsvps.json", {}));
}

export async function addMessage(m: { token: string; name: string; text: string }): Promise<Message> {
  return withLock(async () => {
    const all = await readJson<Message[]>("messages.json", []);
    if (all.filter((x) => x.token === m.token).length >= 5) throw new Error("rate_limited");
    const msg: Message = { ...m, id: randomUUID(), status: "pending", createdAt: new Date().toISOString() };
    all.push(msg);
    await writeJson("messages.json", all);
    return msg;
  });
}

export async function listMessages(status?: Message["status"]): Promise<Message[]> {
  const all = await readJson<Message[]>("messages.json", []);
  return status ? all.filter((m) => m.status === status) : all;
}

export async function setMessageStatus(id: string, status: "approved" | "rejected"): Promise<void> {
  return withLock(async () => {
    const all = await readJson<Message[]>("messages.json", []);
    const msg = all.find((m) => m.id === id);
    if (!msg) throw new Error("not_found");
    msg.status = status;
    await writeJson("messages.json", all);
  });
}
