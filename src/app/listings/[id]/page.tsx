import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Tag, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/AppShell";
import { Gallery } from "@/components/listings/Gallery";
import { ContactCard } from "@/components/listings/ContactCard";
import { ReportDialog } from "@/components/listings/ReportDialog";
import { KindBadge } from "@/components/shared/KindBadge";
import { PriceTag, formatINR } from "@/components/shared/PriceTag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ItemCondition } from "@/types/database";

export const instant = false;

const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
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

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const [{ data: ownerProfile }, { data: ownerContact }, { data: category }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, batch, created_at")
        .eq("id", listing.owner_id)
        .single(),
      supabase
        .from("profile_contacts")
        .select("whatsapp, block")
        .eq("user_id", listing.owner_id)
        .maybeSingle(),
      listing.category_id
        ? supabase
            .from("categories")
            .select("name")
            .eq("id", listing.category_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const ownerName = ownerProfile?.full_name || "Campus member";
  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "IE";

  const isOwner = user.id === listing.owner_id;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/browse"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Back to browse</span>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:sticky lg:top-24 lg:col-span-7">
            <Gallery
              imagePaths={listing.image_paths}
              title={listing.title}
              kind={listing.kind}
            />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={listing.kind} />
                {category?.name && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
                    <Tag className="size-3" />
                    {category.name}
                  </span>
                )}
                {listing.status !== "active" && (
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                    {listing.status}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <PriceTag
                  kind={listing.kind}
                  price={listing.price}
                  rentPeriod={listing.rent_period}
                  size="lg"
                />
                {listing.kind === "rent" &&
                  listing.deposit != null &&
                  listing.deposit > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Refundable deposit: {formatINR(listing.deposit)}
                    </span>
                  )}
              </div>
            </div>

            {listing.description && (
              <div className="space-y-1.5">
                <h2 className="font-display text-sm font-bold text-foreground">
                  Description
                </h2>
                <p className="max-w-[65ch] text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {listing.description}
                </p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
              {listing.condition && (
                <div className="space-y-0.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    <span>Condition</span>
                  </dt>
                  <dd className="font-medium text-foreground">
                    {CONDITION_LABELS[listing.condition]}
                  </dd>
                </div>
              )}

              {listing.pickup_area && (
                <div className="space-y-0.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span>Pickup area</span>
                  </dt>
                  <dd className="font-medium text-foreground">
                    {listing.pickup_area}
                  </dd>
                </div>
              )}

              <div className="space-y-0.5">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>Active until</span>
                </dt>
                <dd className="font-medium text-foreground">
                  {format(new Date(listing.expires_at), "d MMM yyyy")}
                </dd>
              </div>
            </dl>

            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4">
              <Avatar size="lg">
                {ownerProfile?.avatar_url && (
                  <AvatarImage src={ownerProfile.avatar_url} alt={ownerName} />
                )}
                <AvatarFallback className="font-display text-xs font-bold">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-foreground">
                  {ownerName}
                </p>
                {ownerProfile?.batch && (
                  <p className="truncate text-xs text-muted-foreground">
                    Batch: {ownerProfile.batch}
                  </p>
                )}
                {ownerProfile?.created_at && (
                  <p className="text-xs text-muted-foreground">
                    Member since{" "}
                    {format(new Date(ownerProfile.created_at), "MMM yyyy")}
                  </p>
                )}
              </div>
            </div>

            <ContactCard
              whatsapp={ownerContact?.whatsapp ?? null}
              block={ownerContact?.block ?? null}
              listingTitle={listing.title}
              isOwner={isOwner}
              listingId={listing.id}
            />

            {!isOwner && (
              <div className="flex justify-end">
                <ReportDialog listingId={listing.id} reporterId={user.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
