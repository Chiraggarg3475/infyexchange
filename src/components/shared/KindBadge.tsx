import { cn } from "@/lib/utils";
import type { ListingKind } from "@/types/database";

const KIND_LABELS: Record<ListingKind, string> = {
  sell: "For sale",
  rent: "Rent or lend",
  giveaway: "Free",
  wanted: "Wanted",
};

const KIND_STYLES: Record<ListingKind, string> = {
  sell: "border-kind-sell/40 bg-kind-sell/12 text-kind-sell",
  rent: "border-kind-rent/40 bg-kind-rent/12 text-kind-rent",
  giveaway: "border-kind-giveaway/40 bg-kind-giveaway/12 text-kind-giveaway",
  wanted: "border-kind-wanted/40 bg-kind-wanted/12 text-kind-wanted",
};

interface KindBadgeProps {
  kind: ListingKind;
  className?: string;
}

export function KindBadge({ kind, className }: KindBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        KIND_STYLES[kind],
        className
      )}
    >
      {KIND_LABELS[kind]}
    </span>
  );
}
