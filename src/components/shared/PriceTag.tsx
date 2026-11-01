import { cn } from "@/lib/utils";
import type { ListingKind, RentPeriod } from "@/types/database";

interface PriceTagProps {
  kind: ListingKind;
  price?: number | null;
  rentPeriod?: RentPeriod | null;
  customText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TagClipStyle = {
  clipPath:
    "polygon(10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%)",
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PriceTag({
  kind,
  price,
  rentPeriod,
  customText,
  size = "md",
  className,
}: PriceTagProps) {
  let label = customText ?? "";

  if (!customText) {
    if (kind === "giveaway") {
      label = "Free";
    } else if (kind === "wanted") {
      label =
        price && price > 0 ? `Budget ${formatINR(price)}` : "Wanted";
    } else if (kind === "rent") {
      const periodLabel =
        rentPeriod === "day"
          ? "a day"
          : rentPeriod === "week"
            ? "a week"
            : rentPeriod === "month"
              ? "a month"
              : "";
      if (!price || price === 0) {
        label = "Borrow free";
      } else {
        label = `${formatINR(price)} ${periodLabel}`.trim();
      }
    } else {
      label = price != null ? formatINR(price) : "For sale";
    }
  }

  const sizeClasses =
    size === "sm"
      ? "py-0.5 pl-4 pr-2 text-xs"
      : size === "lg"
        ? "py-1.5 pl-6 pr-3.5 text-lg"
        : "py-1 pl-5 pr-2.5 text-sm";

  const holeClasses =
    size === "sm"
      ? "left-1.5 size-1"
      : size === "lg"
        ? "left-2 size-1.5"
        : "left-1.5 size-1.5";

  if (kind === "giveaway") {
    return (
      <span
        style={TagClipStyle}
        className={cn(
          "relative inline-flex items-center rounded-r-md bg-kind-giveaway font-display font-bold tabular-nums text-white select-none",
          sizeClasses,
          className
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full bg-background",
            holeClasses
          )}
        />
        {label}
      </span>
    );
  }

  if (kind === "wanted") {
    return (
      <span
        className={cn(
          "relative inline-flex items-center gap-1.5 rounded-lg border border-kind-wanted bg-kind-wanted/12 px-2.5 py-1 font-display font-bold tabular-nums text-kind-wanted select-none",
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "lg" && "px-3.5 py-1.5 text-lg",
          size === "md" && "text-sm",
          className
        )}
      >
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-kind-wanted"
        />
        {label}
      </span>
    );
  }

  return (
    <span
      style={TagClipStyle}
      className={cn(
        "relative inline-flex items-center rounded-r-md bg-gold font-display font-bold tabular-nums text-gold-ink select-none",
        sizeClasses,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full bg-background",
          holeClasses
        )}
      />
      {label}
    </span>
  );
}
