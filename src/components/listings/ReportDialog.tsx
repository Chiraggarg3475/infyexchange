"use client";

import { useState } from "react";
import { z } from "zod";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapDatabaseError } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReportReason } from "@/types/database";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or duplicate" },
  { value: "prohibited_item", label: "Prohibited item" },
  { value: "scam", label: "Suspicious or scam" },
  { value: "harassment", label: "Harassment or offensive" },
  { value: "other", label: "Other reason" },
];

const reportSchema = z.object({
  reason: z.enum(["spam", "prohibited_item", "scam", "harassment", "other"]),
  details: z
    .string()
    .trim()
    .max(500, "Details must be 500 characters or fewer.")
    .optional(),
});

interface ReportDialogProps {
  listingId: string;
  reporterId: string;
}

export function ReportDialog({ listingId, reporterId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("prohibited_item");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = reportSchema.safeParse({ reason, details });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your report details.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: dbErr } = await supabase.from("reports").insert({
        reporter_id: reporterId,
        target: "listing",
        listing_id: listingId,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
      });

      if (dbErr) throw dbErr;

      setSubmitted(true);
      toast.success("Thanks, we'll review it");
    } catch (err) {
      setError(mapDatabaseError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Flag className="size-3.5" />
        <span>Report listing</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Report listing
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Flag items that break campus community rules.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="space-y-4 py-2">
              <p className="rounded-xl border border-border bg-muted/50 p-4 text-sm font-medium text-foreground">
                Thanks, we&apos;ll review it
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-11 rounded-xl px-4"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="report-reason">Reason</Label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-details">Details (optional)</Label>
                <Textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Any helpful context for the moderator..."
                  maxLength={500}
                  rows={3}
                  className="rounded-xl"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="h-11 rounded-xl px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl px-4"
                >
                  {submitting ? "Sending..." : "Submit report"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
