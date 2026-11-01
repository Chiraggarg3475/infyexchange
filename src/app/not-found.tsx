import { AppShell } from "@/components/shell/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";

export default function NotFound() {
  return (
    <AppShell>
      <EmptyState
        title="Page or listing not found"
        description="This item may have been removed or the link is no longer active."
        actionLabel="Browse campus listings"
        actionHref="/browse"
      />
    </AppShell>
  );
}
