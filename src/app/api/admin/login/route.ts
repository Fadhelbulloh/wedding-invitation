import { expectedSession, hashPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || hashPassword(password) !== expectedSession())
    return new Response("unauthorized", { status: 401 });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": `admin_session=${expectedSession()}; HttpOnly; Path=/; SameSite=Lax${secure}` },
  });
}
