import Link from "next/link";
import { ADMIN_WHATSAPP } from "@/lib/config";
import { AppShell } from "@/components/shell/AppShell";
import { PriceTag } from "@/components/shared/PriceTag";

export const instant = false;

export default function PrivacyPage() {
  const cleanNumber = ADMIN_WHATSAPP.replace(/\D/g, "");
  const adminWaUrl = cleanNumber
    ? `https://wa.me/${cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber}?text=${encodeURIComponent("Hi, please delete my InfyExchange account and data.")}`
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <PriceTag kind="giveaway" customText="Plain language" size="sm" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Privacy notice
          </h1>
          <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            Here is exactly what InfyExchange stores, who can see it, and how
            to delete your data.
          </p>
        </div>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            What we store
          </h2>
          <p className="max-w-[65ch] text-sm leading-relaxed text-foreground">
            We store your name, batch, WhatsApp number, block or hostel, and the
            listings and photos you post. Sign-in uses your Google account via
            Supabase Auth.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            Who can see your contact details
          </h2>
          <p className="max-w-[65ch] text-sm leading-relaxed text-foreground">
            Logged-out visitors and unverified accounts cannot read any
            listings or profiles. Signed-in campus members who have redeemed a
            valid access code can see the WhatsApp number and block of people
            who currently have a live listing, so they can arrange a pickup in
            person. When you have no active or reserved listings, your WhatsApp
            number and block are hidden.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            Deleting your listings or account
          </h2>
          <p className="max-w-[65ch] text-sm leading-relaxed text-foreground">
            You can delete any of your listings (along with its uploaded photos)
            at any time from{" "}
            <Link href="/my" className="underline underline-offset-4">
              My listings
            </Link>
            . To delete your entire account and all stored data, message the
            admin on WhatsApp
            {ADMIN_WHATSAPP ? ` (${ADMIN_WHATSAPP})` : ""}.
          </p>
          {adminWaUrl && (
            <div className="pt-1">
              <a
                href={adminWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Message admin on WhatsApp
              </a>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          <span>Unofficial community app. Not run by Infosys.</span>
          <Link
            href="/rules"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground"
          >
            Read community rules
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
