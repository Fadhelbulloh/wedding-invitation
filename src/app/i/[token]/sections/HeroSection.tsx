"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  partner1: string;
  partner2: string;
  dateDisplay: string;
  guest: string;
  styles: Record<string, string>;
}

export default function HeroSection({ partner1, partner2, dateDisplay, guest, styles }: HeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const content = contentRef.current;
    if (!wrapper || !inner || !content) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(inner, { scale: 1.5, filter: "blur(3px)" });
    gsap.set(content.children, { opacity: 0, y: 30 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 0.8,
      },
    });

    tl.to(inner, { scale: 1, filter: "blur(0px)", duration: 1, ease: "none" }, 0);
    tl.to(content.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 0.3);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.hero}>
      <div ref={innerRef} className={styles.heroInner}>
        <div ref={contentRef} className={styles.heroContent}>
          <p className={styles.kicker}>The wedding of</p>
          <h1>{partner1} &amp; {partner2}</h1>
          <p>{dateDisplay}</p>
          <p className={styles.guest}>Dear {guest}</p>
        </div>
      </div>
    </div>
  );
}
