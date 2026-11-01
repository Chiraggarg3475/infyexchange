"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapDatabaseError } from "@/lib/errors";
import {
  ListingTile,
  type ListingTileItem,
} from "@/components/listings/ListingTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListingKind, Tables } from "@/types/database";

const PAGE_SIZE = 20;

const KIND_TABS: { value: "all" | ListingKind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sell", label: "For sale" },
  { value: "rent", label: "Rent or lend" },
  { value: "giveaway", label: "Free" },
  { value: "wanted", label: "Wanted" },
];

const TILE_COLUMNS =
  "id, kind, title, price, rent_period, image_paths, pickup_area, created_at";

interface BrowseFeedProps {
  categories: Tables<"categories">[];
  initialListings: ListingTileItem[];
  initialHasMore: boolean;
}

export function BrowseFeed({
  categories,
  initialListings,
  initialHasMore,
}: BrowseFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [kindFilter, setKindFilter] = useState<"all" | ListingKind>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [searchDraft, setSearchDraft] = useState<string | null>(null);
  const [listings, setListings] = useState<ListingTileItem[]>(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enableStagger, setEnableStagger] = useState(true);

  const searchInput = searchDraft ?? urlQuery;

  const fetchFeed = useCallback(
    async (opts: {
      kind: "all" | ListingKind;
      catId: number | null;
      q: string;
      offset: number;
      append: boolean;
    }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (
        !supabaseUrl ||
        !supabaseKey ||
        supabaseUrl === "PASTE_HERE" ||
        supabaseKey === "PASTE_HERE" ||
        !supabaseUrl.startsWith("http")
      ) {
        return;
      }

      setEnableStagger(false);
      if (opts.append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const supabase = createClient();
        let queryBuilder = supabase
          .from("listings")
          .select(TILE_COLUMNS)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .range(opts.offset, opts.offset + PAGE_SIZE);

        if (opts.kind !== "all") {
          queryBuilder = queryBuilder.eq("kind", opts.kind);
        }
        if (opts.catId !== null) {
          queryBuilder = queryBuilder.eq("category_id", opts.catId);
        }
        if (opts.q.trim() !== "") {
          queryBuilder = queryBuilder.ilike("title", `%${opts.q.trim()}%`);
        }

        const { data, error: dbErr } = await queryBuilder;
        if (dbErr) throw dbErr;

        const rows = (data ?? []) as ListingTileItem[];
        const moreAvailable = rows.length > PAGE_SIZE;
        const pageItems = rows.slice(0, PAGE_SIZE);

        setHasMore(moreAvailable);
        setListings((prev) =>
          opts.append ? [...prev, ...pageItems] : pageItems
        );
      } catch (err) {
        setError(mapDatabaseError(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (
        kindFilter === "all" &&
        categoryFilter === null &&
        urlQuery.trim() === ""
      ) {
        return;
      }
    }
    void fetchFeed({
      kind: kindFilter,
      catId: categoryFilter,
      q: urlQuery,
      offset: 0,
      append: false,
    });
  }, [kindFilter, categoryFilter, urlQuery, fetchFeed]);

  function handleMobileSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    setSearchDraft(null);
    const qs = params.toString();
    router.push(qs ? `/browse?${qs}` : "/browse");
  }

  function clearFilters() {
    setKindFilter("all");
    setCategoryFilter(null);
    setSearchDraft(null);
    router.push("/browse");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Campus exchange
          </h1>

          <form onSubmit={handleMobileSearch} className="w-full lg:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search listings by title..."
                aria-label="Search listings by title"
                className="h-11 w-full rounded-xl border border-input bg-card pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft(null);
                    router.push("/browse");
                  }}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div
          role="tablist"
          aria-label="Filter by listing kind"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {KIND_TABS.map((tab) => {
            const active = kindFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKindFilter(tab.value)}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          aria-label="Filter by category"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              categoryFilter === null
                ? "border-primary bg-primary/12 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            All categories
          </button>
          {categories.map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) => (prev === cat.id ? null : cat.id))
                }
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/12 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <ShimmerSkeleton className="aspect-[4/5] w-full rounded-[20px]" />
              <ShimmerSkeleton className="h-4 w-3/4 rounded-md" />
              <ShimmerSkeleton className="h-6 w-24 rounded-md" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title="Nothing here yet. Post the first item."
          description={
            kindFilter !== "all" || categoryFilter !== null || urlQuery
              ? "No listings matched those filters. Try clearing filters or post what you need."
              : "Be the first in your batch to list a book, cycle, kettle, or wanted item."
          }
          actionLabel={
            kindFilter !== "all" || categoryFilter !== null || urlQuery
              ? "Clear filters"
              : "Post an item"
          }
          actionHref={
            kindFilter !== "all" || categoryFilter !== null || urlQuery
              ? undefined
              : "/listings/new"
          }
          onAction={
            kindFilter !== "all" || categoryFilter !== null || urlQuery
              ? clearFilters
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {listings.map((item, idx) => (
              <ListingTile
                key={item.id}
                listing={item}
                index={idx}
                animateStagger={enableStagger && idx < 8}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loadingMore}
                onClick={() =>
                  void fetchFeed({
                    kind: kindFilter,
                    catId: categoryFilter,
                    q: urlQuery,
                    offset: listings.length,
                    append: true,
                  })
                }
                className="h-11 rounded-xl px-6"
              >
                {loadingMore ? "Loading more..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
