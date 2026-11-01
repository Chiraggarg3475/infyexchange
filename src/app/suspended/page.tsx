import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function SuspendedPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-foreground"
          >
            InfyExchange
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              Account suspended
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
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
    </div>
  );
}
