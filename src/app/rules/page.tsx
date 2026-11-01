import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { PriceTag } from "@/components/shared/PriceTag";

const PROHIBITED_ITEMS = [
  "Alcohol of any kind",
  "Tobacco, cigarettes, e-cigarettes, or vapes",
  "Drugs, narcotics, or controlled substances",
  "Weapons, knives, fireworks, or explosives",
  "Stolen goods or items you do not own",
  "Prescription medicines or medical devices",
  "Adult content or explicit material",
  "Live animals or pets",
  "Anything banned by Infosys Mysore campus or company policy",
];

const SAFETY_GUIDELINES = [
  "No payments are processed inside InfyExchange. Settle in person when you meet.",
  "Always meet in well-lit public campus areas such as food courts, hostel lobbies, or recreation blocks.",
  "Never share exact room numbers in public listing descriptions; use a general pickup area like 'Block 5 food court'.",
  "Inspect the item in person before handing over money or borrowing it.",
  "Report suspicious behaviour, prohibited items, or harassment using the Report button on any listing.",
];

export default function RulesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <PriceTag kind="sell" customText="Campus rules" size="sm" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Community rules
          </h1>
          <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            InfyExchange is an unofficial community swap-shop run by trainees
            for trainees. Keep it safe, honest, and respectful for everyone on
            campus.
          </p>
        </div>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            What is not allowed
          </h2>
          <p className="text-sm text-muted-foreground">
            Listings for any of the following will be removed immediately and
            the account may be suspended:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
            {PROHIBITED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            Meeting and safety on campus
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
            {SAFETY_GUIDELINES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          <span>Unofficial community app. Not run by Infosys.</span>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground"
          >
            Read privacy notice
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
