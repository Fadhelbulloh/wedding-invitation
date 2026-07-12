"use client";
import { useState } from "react";

export default function MessageForm({ token, guestName }: { token: string; guestName: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: f.get("name"), text: f.get("text") }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thank you! Your message will appear after review.</p>;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <input name="name" defaultValue={guestName} required maxLength={100} placeholder="Your name" />
      <textarea name="text" required maxLength={1000} rows={4} placeholder="Write your wishes..." />
      <button disabled={state === "saving"}>{state === "saving" ? "Sending..." : "Send wishes"}</button>
      {state === "error" && <p role="alert">Could not send. Please try again.</p>}
    </form>
  );
}
