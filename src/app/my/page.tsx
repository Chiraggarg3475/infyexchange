import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/AppShell";
import { MyListingsClient } from "@/components/listings/MyListingsClient";
import type { Tables } from "@/types/database";

export default async function MyListingsPage() {
  let myListings: Tables<"listings">[] = [];

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

    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("owner_id", user.id)
      .neq("status", "removed")
      .order("created_at", { ascending: false });

    if (data) {
      myListings = data;
    }
  }

  return (
    <AppShell>
      <MyListingsClient initialListings={myListings} />
    </AppShell>
  );
}
