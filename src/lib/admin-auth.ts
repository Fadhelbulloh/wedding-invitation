import { createHash } from "node:crypto";

export function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

// ponytail: static hash cookie, no expiry/rotation. Single operator over HTTPS. Upgrade path: signed session with expiry.
export function expectedSession(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not set");
  return hashPassword(pw);
}
