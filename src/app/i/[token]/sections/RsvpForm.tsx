"use client";
import { useState } from "react";

export default function RsvpForm({ token, guestName }: { token: string; guestName: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: f.get("name"),
        attending: f.get("attending") === "yes",
        count: Number(f.get("count")),
        note: f.get("note") ?? "",
      }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thank you! Your RSVP has been recorded.</p>;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <input name="name" defaultValue={guestName} required maxLength={100} placeholder="Your name" />
      <select name="attending" required>
        <option value="yes">Joyfully attending</option>
        <option value="no">Regretfully declining</option>
      </select>
      <input name="count" type="number" min="0" max="10" defaultValue="1" required placeholder="Number of guests" />
      <textarea name="note" maxLength={500} placeholder="Note (optional)" rows={3} />
      <button disabled={state === "saving"}>{state === "saving" ? "Sending..." : "Send RSVP"}</button>
      {state === "error" && <p role="alert">Could not save. Please try again.</p>}
    </form>
  );
}
