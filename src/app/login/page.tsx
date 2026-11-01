import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PriceTag } from "@/components/shared/PriceTag";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-foreground"
          >
            InfyExchange
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 space-y-3">
            <PriceTag kind="sell" customText="Campus only" size="sm" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              Sign in to InfyExchange
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Use your personal Google account. You&apos;ll enter your
              batch&apos;s access code on the next screen.
            </p>
          </div>

          {params.error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              Sign-in couldn&apos;t be completed. Please try again.
            </div>
          )}

          <GoogleSignInButton className="h-12 w-full rounded-xl text-base font-semibold" />

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Unofficial community app. Not run by Infosys. Read the{" "}
            <Link
              href="/rules"
              className="underline underline-offset-4 hover:text-foreground"
            >
              community rules
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              privacy notice
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
