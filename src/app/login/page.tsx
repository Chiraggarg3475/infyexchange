import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 space-y-2">
          <Link href="/" className="text-xl font-bold tracking-tight">
            InfyExchange
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to campus exchange
          </h1>
          <p className="text-sm text-muted-foreground">
            Use your personal Google account. You&apos;ll enter your batch&apos;s
            access code on the next step.
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

        <GoogleSignInButton className="h-11 w-full rounded-xl text-base" />

        <p className="mt-6 text-xs text-muted-foreground">
          Unofficial community app. Not run by Infosys. By continuing, you agree
          to the{" "}
          <Link href="/rules" className="underline underline-offset-4">
            community rules
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy notice
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
