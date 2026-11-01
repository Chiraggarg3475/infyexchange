import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/AppShell";
import { ListingForm } from "@/components/listings/ListingForm";
import type { Tables } from "@/types/database";

const FALLBACK_CATEGORIES: Tables<"categories">[] = [
  { id: 1, slug: "books-study", name: "Books & Study", sort_order: 1 },
  { id: 2, slug: "electronics", name: "Electronics & Gadgets", sort_order: 2 },
  { id: 3, slug: "room-furniture", name: "Room & Furniture", sort_order: 3 },
  { id: 4, slug: "kitchen", name: "Kitchen & Appliances", sort_order: 4 },
  { id: 5, slug: "clothing", name: "Clothing & Footwear", sort_order: 5 },
  { id: 6, slug: "formals", name: "Formals & Accessories", sort_order: 6 },
  { id: 7, slug: "cycles-travel", name: "Cycles & Travel", sort_order: 7 },
  { id: 8, slug: "sports-hobby", name: "Sports & Hobbies", sort_order: 8 },
  { id: 9, slug: "other", name: "Other", sort_order: 99 },
];

export default async function NewListingPage() {
  let categories: Tables<"categories">[] = FALLBACK_CATEGORIES;
  let userId = "";

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

    userId = user.id;

    const { data: catRows } = await supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true });

    if (catRows && catRows.length > 0) {
      categories = catRows;
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Post an item
          </h1>
          <p className="text-sm text-muted-foreground">
            Takes under a minute. Active listings stay up for 30 days.
          </p>
        </div>

        <ListingForm categories={categories} userId={userId} />
      </div>
    </AppShell>
  );
}
