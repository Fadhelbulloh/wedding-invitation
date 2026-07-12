import { promises as fs } from "node:fs";
import path from "node:path";

export async function getGuest(token: string): Promise<string | null> {
  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  try {
    const guests: Record<string, string> = JSON.parse(
      await fs.readFile(path.join(dataDir, "guests.json"), "utf8"),
    );
    return guests[token] ?? null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
