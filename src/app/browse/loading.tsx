import { AppShell } from "@/components/shell/AppShell";
import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

export default function BrowseLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        <ShimmerSkeleton className="h-9 w-48 rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-11 w-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <ShimmerSkeleton className="aspect-[4/5] w-full rounded-[20px]" />
              <ShimmerSkeleton className="h-4 w-3/4 rounded-md" />
              <ShimmerSkeleton className="h-6 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
