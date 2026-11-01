import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PriceTag } from "@/components/shared/PriceTag";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export const instant = false;

export default async function OnboardingPage() {
  let defaultFullName = "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "PASTE_HERE" &&
    supabaseKey !== "PASTE_HERE" &&
    supabaseUrl.startsWith("http")
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "active") {
      redirect("/browse");
    }
    if (profile?.status === "suspended") {
      redirect("/suspended");
    }

    defaultFullName =
      profile?.full_name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      "";
  }

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                className="h-11 rounded-xl px-3.5"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 space-y-2">
            <PriceTag kind="sell" customText="Step 1 of 1" size="sm" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              Complete your campus profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details and your batch&apos;s access code to unlock
              InfyExchange.
            </p>
          </div>

          <OnboardingForm defaultFullName={defaultFullName} />
        </div>
      </main>
    </div>
  );
}
