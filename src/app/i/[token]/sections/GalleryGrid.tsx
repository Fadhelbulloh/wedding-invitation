"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GalleryGridProps {
  images: string[];
  styles: Record<string, string>;
}

export default function GalleryGrid({ images, styles }: GalleryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStart = useRef<number>(0);

  // Scroll reveal
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = grid.querySelectorAll("img");
    gsap.set(imgs, { scale: 0.85, opacity: 0 });
    const triggers: ScrollTrigger[] = [];
    imgs.forEach((img, i) => {
      const trigger = ScrollTrigger.create({
        trigger: img,
        start: "top 90%",
        onEnter: () => gsap.to(img, { scale: 1, opacity: 1, duration: 0.5, delay: (i % 2) * 0.05, ease: "power2.out" }),
        once: true,
      });
      triggers.push(trigger);
    });
    return () => triggers.forEach((t) => t.kill());
  }, [images]);

  // Lock scroll when lightbox open
  useEffect(() => {
    if (lightbox !== null) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const handleSwipe = useCallback((e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    setLightbox((prev) => {
      if (prev === null) return null;
      if (diff > 0) return Math.min(prev + 1, images.length - 1);
      return Math.max(prev - 1, 0);
    });
  }, [images.length]);

  return (
    <>
      <div ref={gridRef} className={styles.gallery}>
        {images.map((src, i) => (
          <img key={src} src={src} alt="" loading="lazy" onClick={() => setLightbox(i)} />
        ))}
      </div>
      {lightbox !== null && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightbox(null)}
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={handleSwipe}
        >
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>×</button>
          <img
            className={styles.lightboxImage}
            src={images[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
