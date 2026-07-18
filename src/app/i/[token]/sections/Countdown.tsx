"use client";
import { useEffect, useState } from "react";

interface CountdownProps {
  targetISO: string;
  dateDisplay: string;
  styles: Record<string, string>;
}

export default function Countdown({ targetISO, dateDisplay, styles }: CountdownProps) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(targetISO).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  if (left === null) return null;
  const d = Math.floor(left / 86400000);
  const h = Math.floor(left / 3600000) % 24;
  const m = Math.floor(left / 60000) % 60;
  const s = Math.floor(left / 1000) % 60;
  return (
    <div className={styles.countdown}>
      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        {[
          { value: d, label: "Days" },
          { value: h, label: "Hours" },
          { value: m, label: "Min" },
          { value: s, label: "Sec" },
        ].map(({ value, label }) => (
          <div key={label}>
            <div className={styles.countdownNumbers}>{value}</div>
            <div className={styles.countdownLabel}>{label}</div>
          </div>
        ))}
      </div>
      <p className={styles.countdownDate}>{dateDisplay}</p>
    </div>
  );
}
