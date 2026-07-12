import { cookies } from "next/headers";
import { expectedSession } from "@/lib/admin-auth";
import { setMessageStatus } from "@/lib/storage";

export async function POST(req: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== expectedSession()) return new Response("unauthorized", { status: 401 });
  const { id, status } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || (status !== "approved" && status !== "rejected"))
    return new Response("bad request", { status: 400 });
  await setMessageStatus(id, status);
  return new Response(null, { status: 204 });
}
