"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PriceTag } from "@/components/shared/PriceTag";
import type { ListingKind } from "@/types/database";

interface SampleTag {
  id: string;
  kind: ListingKind;
  text: string;
  stringHeight: number;
  swayDuration: number;
  swayDelay: number;
}

const SAMPLE_TAGS: SampleTag[] = [
  {
    id: "table",
    kind: "sell",
    text: "Study table ₹1,500",
    stringHeight: 38,
    swayDuration: 4.2,
    swayDelay: 0.1,
  },
  {
    id: "cycle",
    kind: "rent",
    text: "Cycle ₹20 a day",
    stringHeight: 54,
    swayDuration: 4.8,
    swayDelay: 0.4,
  },
  {
    id: "hoodie",
    kind: "giveaway",
    text: "Free: winter hoodie",
    stringHeight: 30,
    swayDuration: 3.9,
    swayDelay: 0.2,
  },
  {
    id: "iron",
    kind: "wanted",
    text: "Wanted: iron box",
    stringHeight: 46,
    swayDuration: 5.1,
    swayDelay: 0.6,
  },
  {
    id: "shoes",
    kind: "sell",
    text: "Formal shoes ₹600",
    stringHeight: 34,
    swayDuration: 4.5,
    swayDelay: 0.3,
  },
];

export function HangingTagsHero() {
  const shouldReduceMotion = useReducedMotion();
  const [swungId, setSwungId] = useState<string | null>(null);

  return (
    <div
      aria-label="Sample campus listings"
      className="relative flex flex-wrap items-start gap-3 pt-1 pb-4 sm:gap-5"
    >
      <div className="pointer-events-none absolute top-0 right-0 left-0 h-px bg-border" />
      {SAMPLE_TAGS.map((tag, index) => {
        const isSwinging = swungId === tag.id;

        return (
          <motion.div
            key={tag.id}
            initial={
              shouldReduceMotion ? false : { y: -36, opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: index * 0.09,
                  }
            }
            style={{ transformOrigin: "top center" }}
            className="flex flex-col items-center"
          >
            <motion.button
              type="button"
              onClick={() => {
                if (shouldReduceMotion) return;
                setSwungId(tag.id);
                window.setTimeout(() => {
                  setSwungId((prev) => (prev === tag.id ? null : prev));
                }, 700);
              }}
              style={{ transformOrigin: "top center" }}
              animate={
                shouldReduceMotion
                  ? { rotate: 0 }
                  : isSwinging
                    ? { rotate: [0, 9, -7, 4, -2, 0] }
                    : { rotate: [-2, 2, -2] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : isSwinging
                    ? { duration: 0.65, ease: "easeInOut" }
                    : {
                        duration: tag.swayDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: tag.swayDelay,
                      }
              }
              className="group flex cursor-pointer flex-col items-center focus-visible:rounded-lg"
            >
              <span
                aria-hidden="true"
                style={{ height: `${tag.stringHeight}px` }}
                className="w-px bg-border transition-colors group-hover:bg-primary"
              />
              <PriceTag kind={tag.kind} customText={tag.text} size="md" />
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
