"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MessageFlightProps {
  messages: Array<{ id: string; name: string; text: string }>;
  styles: Record<string, string>;
}

export default function MessageFlight({ messages, styles }: MessageFlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  // Fewer than 3 messages or reduced motion: static list
  if (messages.length < 3 || reduced) {
    return (
      <ul className={styles.wall}>
        {messages.map((m) => (
          <li key={m.id}><strong>{m.name}</strong><p>{m.text}</p></li>
        ))}
      </ul>
    );
  }

  return <FlightEffect messages={messages} styles={styles} containerRef={containerRef} />;
}

function FlightEffect({
  messages,
  styles,
  containerRef,
}: {
  messages: MessageFlightProps["messages"];
  styles: Record<string, string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const triggers: ScrollTrigger[] = [];
    const spacing = 100 / messages.length;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      // Distribute cards with slight x-offset for organic feel
      const xOffset = (i % 2 === 0 ? -1 : 1) * (5 + (i % 3) * 3);

      gsap.set(card, {
        top: `${i * spacing}%`,
        translateZ: -800,
        scale: 0.3,
        opacity: 0,
        x: `${xOffset}%`,
        filter: "blur(2px)",
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: `top+=${(i / messages.length) * 100}% center`,
        end: `top+=${((i + 1) / messages.length) * 100}% center`,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(card, {
            translateZ: gsap.utils.interpolate(-800, 0, p),
            scale: gsap.utils.interpolate(0.3, 1, p),
            opacity: gsap.utils.interpolate(0, 1, Math.min(p * 2, 1)),
            filter: `blur(${gsap.utils.interpolate(2, 0, p)}px)`,
          });
        },
      });
      triggers.push(trigger);
    });

    return () => triggers.forEach((t) => t.kill());
  }, [messages, containerRef]);

  return (
    <div ref={containerRef} className={styles.messageFlight}>
      {messages.map((m, i) => (
        <div
          key={m.id}
          ref={(el) => { cardRefs.current[i] = el; }}
          className={styles.messageCard}
        >
          <strong>{m.name}</strong>
          <p>{m.text}</p>
        </div>
      ))}
    </div>
  );
}
