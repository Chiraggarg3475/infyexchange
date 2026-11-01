import { AppShell } from "@/components/shell/AppShell";
import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

export default function MyListingsLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <ShimmerSkeleton className="h-9 w-40 rounded-xl" />
          <ShimmerSkeleton className="h-11 w-32 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <ShimmerSkeleton className="h-11 w-36 rounded-xl" />
          <ShimmerSkeleton className="h-11 w-28 rounded-xl" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
