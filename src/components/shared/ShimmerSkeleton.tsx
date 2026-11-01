import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps extends React.ComponentProps<"div"> {
  className?: string;
}

export function ShimmerSkeleton({ className, ...props }: ShimmerSkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shimmer-surface rounded-xl", className)}
      {...props}
    />
  );
}
