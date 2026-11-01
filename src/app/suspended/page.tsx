import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function SuspendedPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Account suspended
          </h1>
          <p className="text-sm text-muted-foreground">
            Your access to InfyExchange has been suspended by a community
            moderator. If you think this is a mistake, contact your batch
            coordinator.
          </p>
        </div>

        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
