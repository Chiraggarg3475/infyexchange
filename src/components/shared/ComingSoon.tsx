"use client";

import { useState } from "react";
import { FEEDBACK_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  featureName: string;
  label?: string;
  description?: string;
  variant?: "button" | "tab" | "card" | "nav";
  icon?: React.ReactNode;
  className?: string;
}

export function ComingSoon({
  featureName,
  label,
  description,
  variant = "button",
  icon,
  className,
}: ComingSoonProps) {
  const [open, setOpen] = useState(false);
  const displayLabel = label ?? featureName;

  return (
    <>
      {variant === "card" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-left transition-colors hover:bg-muted/60 active:scale-98",
            className
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="font-display text-base font-bold text-foreground">
              {displayLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-ink">
              Soon
            </span>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </button>
      ) : variant === "nav" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "relative flex min-h-11 flex-col items-center justify-center gap-0.5 px-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
            className
          )}
        >
          <div className="relative flex items-center justify-center">
            {icon}
            <span className="ml-1 inline-flex items-center rounded-full bg-gold px-1.5 py-0 text-[9px] font-bold text-gold-ink">
              Soon
            </span>
          </div>
          <span>{displayLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/70 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 active:scale-97",
            className
          )}
        >
          {icon}
          <span>{displayLabel}</span>
          <span className="inline-flex items-center rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-ink">
            Soon
          </span>
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle className="font-display text-lg font-bold">
                {featureName}
              </SheetTitle>
              <span className="inline-flex items-center rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-ink">
                Soon
              </span>
            </div>
            <SheetDescription className="pt-1 text-sm text-muted-foreground">
              We&apos;re building this. Want it sooner? Tell us what you&apos;d
              like.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 rounded-xl px-4"
            >
              Close
            </Button>
            {FEEDBACK_URL.trim() !== "" && (
              <a
                href={FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Share feedback
              </a>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
