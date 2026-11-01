"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { getPublicImageUrl } from "@/lib/images";
import { PriceTag } from "@/components/shared/PriceTag";
import { KindBadge } from "@/components/shared/KindBadge";
import type { ListingKind, RentPeriod } from "@/types/database";

export interface ListingTileItem {
  id: string;
  kind: ListingKind;
  title: string;
  price: number | null;
  rent_period: RentPeriod | null;
  image_paths: string[];
  pickup_area: string | null;
  created_at: string;
}

interface ListingTileProps {
  listing: ListingTileItem;
  index: number;
  animateStagger?: boolean;
}

export function ListingTile({
  listing,
  index,
  animateStagger = false,
}: ListingTileProps) {
  const shouldReduceMotion = useReducedMotion();
  const firstImage = listing.image_paths?.[0];
  const shouldStagger = animateStagger && !shouldReduceMotion && index < 8;

  return (
    <motion.div
      initial={shouldStagger ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldStagger
          ? {
              type: "spring",
              stiffness: 300,
              damping: 26,
              delay: index * 0.04,
            }
          : { duration: 0 }
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
    >
      <Link
        href={`/listings/${listing.id}`}
        className="group flex flex-col gap-2.5 focus-visible:rounded-[20px]"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-muted">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getPublicImageUrl(firstImage, true)}
              alt={listing.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
              <KindBadge kind={listing.kind} />
              <span className="line-clamp-2 font-display text-sm font-bold text-muted-foreground">
                {listing.title}
              </span>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5">
            <KindBadge
              kind={listing.kind}
              className="bg-background/90 backdrop-blur-xs"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 px-0.5">
          <h3 className="line-clamp-1 font-sans text-sm font-medium text-foreground sm:text-base">
            {listing.title}
          </h3>
          <div className="flex w-full items-center justify-between gap-2">
            <PriceTag
              kind={listing.kind}
              price={listing.price}
              rentPeriod={listing.rent_period}
              size="sm"
            />
            {listing.pickup_area && (
              <span className="truncate text-xs text-muted-foreground">
                {listing.pickup_area}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
