"use client";
import { useEffect, useState } from "react";

export default function Countdown({ targetISO }: { targetISO: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(targetISO).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  if (left === null) return null;
  const d = Math.floor(left / 86400000), h = Math.floor(left / 3600000) % 24,
    m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
  return <p style={{ fontSize: "1.3rem", textAlign: "center" }}>{d}d {h}h {m}m {s}s</p>;
}
