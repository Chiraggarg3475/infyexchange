import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/AppShell";
import { BrowseFeed } from "@/components/listings/BrowseFeed";
import type { ListingTileItem } from "@/components/listings/ListingTile";
import type { Tables } from "@/types/database";

const PAGE_SIZE = 20;

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

export default async function BrowsePage() {
  let categories: Tables<"categories">[] = FALLBACK_CATEGORIES;
  let initialListings: ListingTileItem[] = [];
  let initialHasMore = false;

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

      const [{ data: catData }, { data: feedData }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, slug, name, sort_order")
          .order("sort_order", { ascending: true }),
        supabase
          .from("listings")
          .select(
            "id, kind, title, price, rent_period, image_paths, pickup_area, created_at"
          )
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE),
      ]);

      if (catData && catData.length > 0) {
        categories = catData;
      }

      if (feedData) {
        initialHasMore = feedData.length > PAGE_SIZE;
        initialListings = feedData.slice(0, PAGE_SIZE) as ListingTileItem[];
      }
    } catch {
      // Render empty state if DB is unreachable
    }
  }

  return (
    <AppShell>
      <Suspense fallback={null}>
        <BrowseFeed
          categories={categories}
          initialListings={initialListings}
          initialHasMore={initialHasMore}
        />
      </Suspense>
    </AppShell>
  );
}
