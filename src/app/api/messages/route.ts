import { getGuest } from "@/lib/guests";
import { addMessage } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { token?: string; name?: string; text?: string };
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
  const { token, name, text } = body;
  if (!token || !(await getGuest(token))) return new Response("invalid token", { status: 403 });
  if (typeof name !== "string" || !name.trim() || name.length > 100) return new Response("invalid name", { status: 400 });
  if (typeof text !== "string" || !text.trim() || text.length > 1000) return new Response("invalid text", { status: 400 });
  try {
    const m = await addMessage({ token, name: name.trim(), text: text.trim() });
    return Response.json({ id: m.id }, { status: 201 });
  } catch (err) {
    if ((err as Error).message === "rate_limited") return new Response("too many messages", { status: 429 });
    return new Response("storage error, please retry", { status: 500 });
  }
}
