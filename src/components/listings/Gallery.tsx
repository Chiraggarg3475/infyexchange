"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPublicImageUrl } from "@/lib/images";
import { KindBadge } from "@/components/shared/KindBadge";
import { cn } from "@/lib/utils";
import type { ListingKind } from "@/types/database";

interface GalleryProps {
  imagePaths: string[];
  title: string;
  kind: ListingKind;
}

export function Gallery({ imagePaths, title, kind }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);
  const count = imagePaths.length;

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
  }, [count]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    function onKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, goPrev, goNext]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-border bg-muted p-6 text-center">
        <KindBadge kind={kind} />
        <p className="font-display text-lg font-bold text-muted-foreground">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">No photo attached</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || count <= 1) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const delta = endX - touchStartX.current;
          if (Math.abs(delta) > 40) {
            if (delta < 0) goNext();
            else goPrev();
          }
          touchStartX.current = null;
        }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-muted"
      >
        <motion.img
          key={imagePaths[activeIndex]}
          src={getPublicImageUrl(imagePaths[activeIndex], false)}
          alt={`${title} – photo ${activeIndex + 1} of ${count}`}
          loading="lazy"
          initial={shouldReduceMotion ? false : { opacity: 0.4, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className="size-full object-cover"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-xs transition-transform hover:bg-background active:scale-96"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-xs transition-transform hover:bg-background active:scale-96"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          role="tablist"
          aria-label="Gallery photos"
          className="flex items-center justify-center gap-2"
        >
          {imagePaths.map((p, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Show photo ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center px-1"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all duration-200",
                    active ? "w-6 bg-gold" : "w-2 bg-border"
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
