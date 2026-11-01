import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">InfyExchange</h1>
        <p className="text-muted-foreground">
          A swap-shop for Infosys Mysore trainees. Post an item in a minute,
          then meet in person.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <GoogleSignInButton />
          <Link
            href="/login"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Go to sign in
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Unofficial community app. Not run by Infosys.
        </p>
      </div>
    </main>
  );
}
