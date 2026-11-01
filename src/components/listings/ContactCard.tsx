"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle, MapPin, ShieldAlert } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { Button } from "@/components/ui/button";

interface ContactCardProps {
  whatsapp: string | null;
  block: string | null;
  listingTitle: string;
  isOwner: boolean;
  listingId: string;
}

export function ContactCard({
  whatsapp,
  block,
  listingTitle,
  isOwner,
  listingId,
}: ContactCardProps) {
  const [revealed, setRevealed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (isOwner) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="font-display text-base font-bold text-foreground">
            This is your listing
          </h2>
          <p className="text-sm text-muted-foreground">
            You can edit details, mark it as done, or manage it from My
            listings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/listings/${listingId}/edit`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform active:scale-97"
          >
            Edit listing
          </Link>
          <Link
            href="/my"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Manage in My listings
          </Link>
        </div>
      </div>
    );
  }

  const encodedMessage = encodeURIComponent(
    `Hi, I saw your "${listingTitle}" listing on InfyExchange.`
  );
  const whatsappUrl = whatsapp
    ? `https://wa.me/91${whatsapp}?text=${encodedMessage}`
    : null;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        {!revealed ? (
          <Button
            type="button"
            onClick={() => setRevealed(true)}
            className="h-11 flex-1 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground active:scale-98"
          >
            Contact owner
          </Button>
        ) : null}

        <ComingSoon featureName="Send a request" label="Send a request" />
        <ComingSoon featureName="Save for later" label="Save for later" />
      </div>

      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div
            key="contact-details"
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: -6 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 340, damping: 24 }
            }
            className="space-y-3 rounded-xl border border-border bg-background/70 p-4"
          >
            {whatsappUrl ? (
              <div className="space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-display text-sm font-bold text-primary-foreground transition-transform active:scale-98"
                >
                  <MessageCircle className="size-4" />
                  <span>Chat on WhatsApp</span>
                </a>
                {block && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>Block / hostel: {block}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                The owner hasn&apos;t shared a number
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-foreground" />
        <span>Meet in public campus areas. No payments happen in this app.</span>
      </div>
    </div>
  );
}
