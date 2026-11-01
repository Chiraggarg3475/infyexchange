"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { mapDatabaseError } from "@/lib/errors";

interface GoogleSignInButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}

export function GoogleSignInButton({
  className,
  size = "lg",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) {
        setError(mapDatabaseError(authError));
        setLoading(false);
      }
    } catch (err) {
      setError(mapDatabaseError(err));
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <Button
        type="button"
        size={size}
        onClick={handleSignIn}
        disabled={loading}
        className={className}
      >
        <svg
          className="mr-2 size-4"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="currentColor"
        >
          <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.65 5 12c0-3.65 3.36-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
        </svg>
        {loading ? "Connecting to Google..." : label}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
