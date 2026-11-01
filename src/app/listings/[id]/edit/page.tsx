import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/AppShell";
import { ListingForm } from "@/components/listings/ListingForm";
import type { Tables } from "@/types/database";

export const instant = false;

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "PASTE_HERE" ||
    supabaseKey === "PASTE_HERE" ||
    !supabaseUrl.startsWith("http")
  ) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: listing }, { data: categories }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).single(),
    supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  if (!listing) {
    notFound();
  }

  if (listing.owner_id !== user.id) {
    redirect(`/listings/${id}`);
  }

  const safeCategories: Tables<"categories">[] = categories ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Edit listing
          </h1>
          <p className="text-sm text-muted-foreground">
            Update details or swap photos for your listing.
          </p>
        </div>

        <ListingForm
          categories={safeCategories}
          userId={user.id}
          initialListing={listing}
        />
      </div>
    </AppShell>
  );
}
