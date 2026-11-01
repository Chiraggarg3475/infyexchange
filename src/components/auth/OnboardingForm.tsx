"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { mapDatabaseError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name (at least 2 characters).")
    .max(80, "Full name must be 80 characters or fewer."),
  batch: z
    .string()
    .trim()
    .max(40, "Batch must be 40 characters or fewer.")
    .optional(),
  whatsapp: z
    .string()
    .trim()
    .regex(
      /^[6-9][0-9]{9}$/,
      "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
    ),
  block: z
    .string()
    .trim()
    .max(60, "Block or hostel must be 60 characters or fewer.")
    .optional(),
  code: z
    .string()
    .trim()
    .min(6, "Enter your campus access code (at least 6 characters).")
    .max(40, "Access code must be 40 characters or fewer."),
});

interface OnboardingFormProps {
  defaultFullName: string;
}

export function OnboardingForm({ defaultFullName }: OnboardingFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultFullName);
  const [batch, setBatch] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [block, setBlock] = useState("");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const parsed = onboardingSchema.safeParse({
      fullName,
      batch,
      whatsapp,
      block,
      code,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("redeem_access_code", {
        p_code: parsed.data.code.toUpperCase(),
        p_full_name: parsed.data.fullName,
        p_batch: parsed.data.batch ?? "",
        p_whatsapp: parsed.data.whatsapp,
        p_block: parsed.data.block || null,
      });

      if (error) {
        const mapped = mapDatabaseError(error);
        if (mapped === "already_active") {
          router.replace("/browse");
          router.refresh();
          return;
        }
        if (mapped === "suspended") {
          router.replace("/suspended");
          router.refresh();
          return;
        }
        setServerError(mapped);
        setSubmitting(false);
        return;
      }

      router.replace("/browse");
      router.refresh();
    } catch (err) {
      setServerError(mapDatabaseError(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Aarav Sharma"
          required
          className="h-11 rounded-xl"
          aria-invalid={!!fieldErrors.fullName}
        />
        {fieldErrors.fullName && (
          <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="batch">Batch (optional)</Label>
        <Input
          id="batch"
          name="batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          placeholder="Nov 2026 – Wing A"
          maxLength={40}
          className="h-11 rounded-xl"
          aria-invalid={!!fieldErrors.batch}
        />
        {fieldErrors.batch && (
          <p className="text-xs text-destructive">{fieldErrors.batch}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">WhatsApp number</Label>
        <div className="flex items-center gap-2">
          <span className="flex h-11 items-center rounded-xl border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
            +91
          </span>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="9876543210"
            maxLength={10}
            required
            className="h-11 rounded-xl"
            aria-invalid={!!fieldErrors.whatsapp}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Shown to signed-in campus members when you have a live listing.
        </p>
        {fieldErrors.whatsapp && (
          <p className="text-xs text-destructive">{fieldErrors.whatsapp}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="block">Block or hostel (optional)</Label>
        <Input
          id="block"
          name="block"
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          placeholder="ECC Block 12"
          maxLength={60}
          className="h-11 rounded-xl"
          aria-invalid={!!fieldErrors.block}
        />
        {fieldErrors.block && (
          <p className="text-xs text-destructive">{fieldErrors.block}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="code">Campus access code</Label>
        <Input
          id="code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="INFY-MYS-K7Q2X9PD"
          maxLength={40}
          required
          className="h-11 rounded-xl font-mono tracking-wider uppercase"
          aria-invalid={!!fieldErrors.code}
        />
        {fieldErrors.code && (
          <p className="text-xs text-destructive">{fieldErrors.code}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-11 w-full rounded-xl text-base"
      >
        {submitting ? "Verifying code..." : "Join campus exchange"}
      </Button>
    </form>
  );
}
