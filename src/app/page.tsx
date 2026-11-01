import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { HangingTagsHero } from "@/components/shared/HangingTagsHero";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-foreground"
          >
            InfyExchange
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="hidden sm:block">
              <GoogleSignInButton
                size="default"
                className="h-11 rounded-xl px-4 text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
        <HangingTagsHero />

        <div className="mt-6 max-w-2xl space-y-5">
          <h1
            style={{ fontSize: "clamp(40px, 7vw, 72px)" }}
            className="font-display leading-[1.06] font-bold tracking-tight text-foreground"
          >
            Buy, sell, borrow or give away. Right on campus.
          </h1>

          <p className="max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            A swap-shop for Infosys Mysore trainees. Post an item in a minute,
            then meet in person.
          </p>

          <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <GoogleSignInButton className="h-12 rounded-xl px-6 text-base font-semibold" />
            <p className="text-sm text-muted-foreground">
              You&apos;ll need your batch&apos;s access code.
            </p>
          </div>

          <p className="pt-4 text-xs text-muted-foreground">
            Unofficial community app. Not run by Infosys.{" "}
            <Link
              href="/rules"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Community rules
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy notice
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
