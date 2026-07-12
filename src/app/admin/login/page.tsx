"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [err, setErr] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: f.get("password") }),
    });
    if (res.ok) window.location.href = "/admin";
    else setErr(true);
  }
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, width: 280 }}>
        <input name="password" type="password" placeholder="Admin password" required />
        <button>Login</button>
        {err && <p role="alert">Wrong password</p>}
      </form>
    </main>
  );
}
