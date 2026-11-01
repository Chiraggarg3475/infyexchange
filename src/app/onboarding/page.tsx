import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

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
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Complete your campus profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details and your batch&apos;s access code to unlock
              InfyExchange.
            </p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>

        <OnboardingForm defaultFullName={defaultFullName} />
      </div>
    </main>
  );
}
