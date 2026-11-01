"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Compass, Package, Plus, Bell, User } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const isBrowse = pathname === "/browse";
  const isMy = pathname.startsWith("/my");
  const isProfile = pathname === "/rules" || pathname === "/privacy";

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        <Link
          href="/browse"
          className={cn(
            "relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
            isBrowse
              ? "text-gold-ink"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isBrowse && (
            <motion.span
              layoutId={shouldReduceMotion ? undefined : "bottom-nav-pill"}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 30 }
              }
              className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-xl bg-gold"
            />
          )}
          <Compass className="size-4" />
          <span>Browse</span>
        </Link>

        <Link
          href="/my"
          className={cn(
            "relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
            isMy
              ? "text-gold-ink"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isMy && (
            <motion.span
              layoutId={shouldReduceMotion ? undefined : "bottom-nav-pill"}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 30 }
              }
              className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-xl bg-gold"
            />
          )}
          <Package className="size-4" />
          <span>My</span>
        </Link>

        <div className="flex items-center justify-center">
          <Link
            href="/listings/new"
            aria-label="Post an item"
            className="-mt-6 inline-flex size-13 items-center justify-center rounded-full bg-gold text-gold-ink shadow-[0_8px_20px_rgba(16,32,26,0.22)] ring-4 ring-background transition-transform active:scale-96"
          >
            <Plus className="size-6 stroke-[2.5]" />
          </Link>
        </div>

        <ComingSoon
          featureName="Notifications"
          label="Alerts"
          variant="nav"
          icon={<Bell className="size-4" />}
        />

        <ComingSoon
          featureName="Profile and settings"
          label="Profile"
          variant="nav"
          icon={<User className={cn("size-4", isProfile && "text-gold")} />}
        />
      </div>
    </nav>
  );
}
