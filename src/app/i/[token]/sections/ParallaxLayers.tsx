"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../invitation.module.css";

gsap.registerPlugin(ScrollTrigger);

const layers: Array<{ size: number; top: string; left?: string; right?: string; opacity: number; speed: number; color: string }> = [
  { size: 120, top: "10%", left: "5%", opacity: 0.07, speed: 0.3, color: "184,150,90" },
  { size: 80, top: "30%", right: "0%", opacity: 0.05, speed: 0.2, color: "184,150,90" },
  { size: 100, top: "55%", left: "10%", opacity: 0.06, speed: 0.4, color: "107,94,80" },
  { size: 60, top: "75%", right: "8%", opacity: 0.08, speed: 0.5, color: "184,150,90" },
];

export default function ParallaxLayers() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const triggers: ScrollTrigger[] = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const trigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(el, { y: self.progress * window.innerHeight * layers[i].speed * -1 });
        },
      });
      triggers.push(trigger);
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div className={styles.parallaxContainer}>
      {layers.map((l, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className={styles.parallaxLayer}
          style={{
            width: l.size,
            height: l.size,
            top: l.top,
            left: l.left,
            right: l.right,
            background: `radial-gradient(circle, rgba(${l.color},${l.opacity}), transparent)`,
          }}
        />
      ))}
    </div>
  );
}
