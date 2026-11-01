import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center rounded-2xl border border-dashed border-border bg-card/50 p-6 sm:p-10",
        className
      )}
    >
      <h2 className="font-display text-lg font-bold text-foreground">
        {title}
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 font-medium text-gold-ink transition-transform active:scale-97"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionHref && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 font-medium text-gold-ink transition-transform active:scale-97"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
