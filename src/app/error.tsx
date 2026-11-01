"use client";

import { EmptyState } from "@/components/shared/EmptyState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center p-4 sm:p-6">
      <EmptyState
        title="Something went wrong"
        description="The page couldn't finish loading. Reload to try again."
        actionLabel="Try again"
        onAction={() => reset()}
      />
    </main>
  );
}
