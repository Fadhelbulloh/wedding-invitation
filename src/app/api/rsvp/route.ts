import { getGuest } from "@/lib/guests";
import { saveRsvp } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { token?: string; name?: string; attending?: boolean; count?: number; note?: string };
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
  const { token, name, attending, count, note } = body;
  if (!token || !(await getGuest(token))) return new Response("invalid token", { status: 403 });
  if (typeof name !== "string" || !name.trim() || name.length > 100) return new Response("invalid name", { status: 400 });
  if (typeof attending !== "boolean") return new Response("invalid attending", { status: 400 });
  const n = Number(count);
  if (!Number.isInteger(n) || n < 0 || n > 10) return new Response("invalid count", { status: 400 });
  if (typeof note !== "string" || note.length > 500) return new Response("invalid note", { status: 400 });
  try {
    await saveRsvp({ token, name: name.trim(), attending, count: n, note });
  } catch {
    return new Response("storage error, please retry", { status: 500 });
  }
  return new Response(null, { status: 204 });
}
