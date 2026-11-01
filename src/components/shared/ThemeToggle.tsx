"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "motion/react";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      className="relative inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
    >
      {mounted ? (
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={
            shouldReduceMotion ? false : { rotate: -65, opacity: 0, scale: 0.7 }
          }
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 320, damping: 22 }
          }
          className="inline-flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="size-5 text-gold" />
          ) : (
            <Sun className="size-5 text-primary" />
          )}
        </motion.span>
      ) : (
        <span className="size-5" />
      )}
    </motion.button>
  );
}
