import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/shell/TopBar";
import { BottomNav } from "@/components/shell/BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  let fullName = "Campus member";
  let avatarUrl: string | null = null;
  let batch: string | null = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "PASTE_HERE" &&
    supabaseKey !== "PASTE_HERE" &&
    supabaseUrl.startsWith("http")
  ) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, batch")
          .eq("id", user.id)
          .single();

        if (profile) {
          fullName = profile.full_name || fullName;
          avatarUrl = profile.avatar_url;
          batch = profile.batch;
        }
      }
    } catch {
      // Fall back to default shell state if unauthenticated
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Suspense
        fallback={
          <div className="h-16 border-b border-border bg-background" />
        }
      >
        <TopBar
          userFullName={fullName}
          userAvatarUrl={avatarUrl}
          userBatch={batch}
        />
      </Suspense>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-24 sm:px-6 md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
