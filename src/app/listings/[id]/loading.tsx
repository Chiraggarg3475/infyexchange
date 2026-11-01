import { AppShell } from "@/components/shell/AppShell";
import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

export default function ListingDetailLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        <ShimmerSkeleton className="h-10 w-36 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ShimmerSkeleton className="aspect-[4/5] w-full rounded-[20px]" />
          </div>
          <div className="space-y-5 lg:col-span-5">
            <ShimmerSkeleton className="h-6 w-24 rounded-full" />
            <ShimmerSkeleton className="h-9 w-3/4 rounded-xl" />
            <ShimmerSkeleton className="h-10 w-32 rounded-xl" />
            <ShimmerSkeleton className="h-24 w-full rounded-2xl" />
            <ShimmerSkeleton className="h-28 w-full rounded-2xl" />
            <ShimmerSkeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
