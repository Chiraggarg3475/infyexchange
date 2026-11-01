"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Bell, LogOut, Package, Compass, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface TopBarProps {
  userFullName?: string;
  userAvatarUrl?: string | null;
  userBatch?: string | null;
}

export function TopBar({
  userFullName = "Campus member",
  userAvatarUrl,
  userBatch,
}: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const initials =
    userFullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "IE";

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(
      pathname === "/browse" ? searchParams.toString() : ""
    );
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(qs ? `/browse?${qs}` : "/browse");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/browse"
            className="font-display text-xl font-bold tracking-tight text-foreground"
          >
            InfyExchange
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/browse"
              className={cn(
                "inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors",
                pathname === "/browse"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Browse
            </Link>
            <Link
              href="/my"
              className={cn(
                "inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors",
                pathname.startsWith("/my")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              My listings
            </Link>
          </nav>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden max-w-md flex-1 lg:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus listings..."
              aria-label="Search campus listings"
              className="h-11 w-full rounded-xl border border-input bg-card pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>
        </form>

        <div className="flex items-center gap-2.5">
          <div className="hidden lg:block">
            <ComingSoon
              featureName="Notifications"
              label="Alerts"
              icon={<Bell className="size-4" />}
            />
          </div>

          <Link
            href="/listings/new"
            className="hidden h-11 items-center justify-center rounded-xl bg-gold px-4 font-display text-sm font-bold text-gold-ink transition-transform hover:opacity-95 active:scale-97 lg:inline-flex"
          >
            Post an item
          </Link>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-muted"
            >
              <Avatar className="size-8">
                {userAvatarUrl && (
                  <AvatarImage src={userAvatarUrl} alt={userFullName} />
                )}
                <AvatarFallback className="font-display text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2.5 py-2">
                  <p className="truncate font-display text-sm font-bold text-foreground">
                    {userFullName}
                  </p>
                  {userBatch && (
                    <p className="truncate text-xs text-muted-foreground">
                      {userBatch}
                    </p>
                  )}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/browse")}
                className="min-h-11 cursor-pointer rounded-xl px-2.5"
              >
                <Compass className="size-4" />
                <span>Browse listings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/my")}
                className="min-h-11 cursor-pointer rounded-xl px-2.5"
              >
                <Package className="size-4" />
                <span>My listings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/rules")}
                className="min-h-11 cursor-pointer rounded-xl px-2.5"
              >
                <ShieldCheck className="size-4" />
                <span>Community rules</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  void signOutAction();
                }}
                className="min-h-11 cursor-pointer rounded-xl px-2.5"
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
