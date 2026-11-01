"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapDatabaseError } from "@/lib/errors";
import { getPublicImageUrl, getStoragePathsWithThumbs } from "@/lib/images";
import { KindBadge } from "@/components/shared/KindBadge";
import { PriceTag } from "@/components/shared/PriceTag";
import { EmptyState } from "@/components/shared/EmptyState";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

interface MyListingsClientProps {
  initialListings: Tables<"listings">[];
}

export function MyListingsClient({ initialListings }: MyListingsClientProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "upcoming">(
    "listings"
  );
  const [listings, setListings] =
    useState<Tables<"listings">[]>(initialListings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tables<"listings"> | null>(
    null
  );
  const shouldReduceMotion = useReducedMotion();

  async function handleStatusChange(
    listing: Tables<"listings">,
    nextStatus: "active" | "closed"
  ) {
    setBusyId(listing.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({ status: nextStatus })
        .eq("id", listing.id);
      if (error) throw error;

      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, status: nextStatus } : item
        )
      );
      toast.success(
        nextStatus === "closed" ? "Marked as done" : "Listing reopened"
      );
    } catch (err) {
      toast.error(mapDatabaseError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRenew(listing: Tables<"listings">) {
    setBusyId(listing.id);
    try {
      const supabase = createClient();
      const nextExpiry = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await supabase
        .from("listings")
        .update({ expires_at: nextExpiry, status: "active" })
        .eq("id", listing.id);
      if (error) throw error;

      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? { ...item, expires_at: nextExpiry, status: "active" }
            : item
        )
      );
      toast.success("Renewed for 30 days");
    } catch (err) {
      toast.error(mapDatabaseError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.id);

    try {
      const supabase = createClient();

      if (target.image_paths && target.image_paths.length > 0) {
        await supabase.storage
          .from("listing-images")
          .remove(getStoragePathsWithThumbs(target.image_paths));
      }

      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", target.id);
      if (error) throw error;

      setListings((prev) => prev.filter((item) => item.id !== target.id));
      setDeleteTarget(null);
      toast.success("Listing deleted");
    } catch (err) {
      toast.error(mapDatabaseError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            My exchange
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your active and past campus listings.
          </p>
        </div>

        <Link
          href="/listings/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-4 font-display text-sm font-bold text-gold-ink transition-transform active:scale-97"
        >
          Post an item
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="My exchange sections"
        className="flex items-center gap-2 border-b border-border pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "listings"}
          onClick={() => setActiveTab("listings")}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors",
            activeTab === "listings"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          My listings ({listings.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors",
            activeTab === "upcoming"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Upcoming
        </button>
      </div>

      {activeTab === "upcoming" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <ComingSoon
            variant="card"
            featureName="Requests inbox"
            label="Requests"
            description="Accept or decline interest requests before revealing your contact details."
          />
          <ComingSoon
            variant="card"
            featureName="In-app chat"
            label="Chat"
            description="Message campus members directly without leaving InfyExchange."
          />
          <ComingSoon
            variant="card"
            featureName="Campus ratings"
            label="Ratings"
            description="Build trust across batches with simple post-exchange feedback."
          />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title="Nothing here yet. Post the first item."
          description="Items you list for sale, rent, giveaway, or wanted will show up here."
          actionLabel="Post an item"
          actionHref="/listings/new"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {listings.map((item) => {
              const thumb = item.image_paths?.[0];
              const isExpired = new Date(item.expires_at) <= new Date();
              const isBusy = busyId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout={!shouldReduceMotion}
                  initial={false}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scaleY: 0,
                          transition: { duration: 0.22, ease: "easeInOut" },
                        }
                  }
                  style={{ transformOrigin: "top" }}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <Link
                      href={`/listings/${item.id}`}
                      className="aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-[16px] bg-muted"
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getPublicImageUrl(thumb, true)}
                          alt={item.title}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                          No photo
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <KindBadge kind={item.kind} />
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                            item.status === "active" && !isExpired
                              ? "border-primary/40 bg-primary/10 text-foreground"
                              : "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {isExpired ? "Expired" : item.status}
                        </span>
                      </div>

                      <Link
                        href={`/listings/${item.id}`}
                        className="block font-display text-base font-bold text-foreground hover:underline"
                      >
                        {item.title}
                      </Link>

                      <div className="flex flex-wrap items-center gap-3">
                        <PriceTag
                          kind={item.kind}
                          price={item.price}
                          rentPeriod={item.rent_period}
                          size="sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          Expires {format(new Date(item.expires_at), "d MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === "closed" ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => void handleStatusChange(item, "active")}
                        className="h-11 rounded-xl px-3.5"
                      >
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => void handleStatusChange(item, "closed")}
                        className="h-11 rounded-xl px-3.5"
                      >
                        Mark as done
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => void handleRenew(item)}
                      className="h-11 rounded-xl px-3.5"
                    >
                      Renew 30 days
                    </Button>

                    <Link
                      href={`/listings/${item.id}/edit`}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Edit
                    </Link>

                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isBusy}
                      onClick={() => setDeleteTarget(item)}
                      className="h-11 rounded-xl px-3.5"
                    >
                      Delete listing
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete listing"
        description={`Delete "${deleteTarget?.title ?? "this listing"}" permanently? Its photos will also be removed.`}
        confirmLabel="Delete listing"
        destructive
        loading={busyId === deleteTarget?.id}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
