"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapDatabaseError } from "@/lib/errors";
import { compressAndUploadPhoto, getStoragePathsWithThumbs } from "@/lib/images";
import { PhotoPicker, type PhotoSlot } from "@/components/listings/PhotoPicker";
import { PriceTag } from "@/components/shared/PriceTag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  ItemCondition,
  ListingKind,
  RentPeriod,
  Tables,
} from "@/types/database";

const KIND_OPTIONS: {
  value: ListingKind;
  label: string;
  hint: string;
}[] = [
  { value: "sell", label: "For sale", hint: "Fixed price in rupees" },
  { value: "rent", label: "Rent or lend", hint: "Per day, week or month" },
  { value: "giveaway", label: "Free", hint: "Give away to a batchmate" },
  { value: "wanted", label: "Wanted", hint: "Ask if someone has it" },
];

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const PERIOD_OPTIONS: { value: RentPeriod; label: string }[] = [
  { value: "day", label: "Per day" },
  { value: "week", label: "Per week" },
  { value: "month", label: "Per month" },
];

const listingSchema = z
  .object({
    kind: z.enum(["sell", "rent", "giveaway", "wanted"]),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(80, "Title must be 80 characters or fewer."),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be 1000 characters or fewer."),
    categoryId: z.number().int().positive("Choose a category."),
    price: z.number().int().min(0, "Enter a non-negative amount.").nullable(),
    rentPeriod: z.enum(["day", "week", "month"]).nullable(),
    deposit: z.number().int().min(0, "Enter a non-negative deposit.").nullable(),
    condition: z.enum(["new", "like_new", "good", "fair"]).nullable(),
    pickupArea: z
      .string()
      .trim()
      .max(60, "Pickup area must be 60 characters or fewer."),
  })
  .superRefine((val, ctx) => {
    if (val.kind === "sell" && (val.price === null || val.price < 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Enter a sale price in rupees.",
      });
    }
    if (val.kind === "rent" && !val.rentPeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rentPeriod"],
        message: "Choose a rental period.",
      });
    }
    if (val.kind !== "wanted" && !val.condition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["condition"],
        message: "Select the item condition.",
      });
    }
    if (val.kind === "wanted" && val.description.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Describe what you are looking for.",
      });
    }
  });

interface ListingFormProps {
  categories: Tables<"categories">[];
  userId: string;
  initialListing?: Tables<"listings">;
}

export function ListingForm({
  categories,
  userId,
  initialListing,
}: ListingFormProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const isEditing = !!initialListing;

  const [kind, setKind] = useState<ListingKind>(initialListing?.kind ?? "sell");
  const [title, setTitle] = useState(initialListing?.title ?? "");
  const [description, setDescription] = useState(
    initialListing?.description ?? ""
  );
  const [categoryId, setCategoryId] = useState<number>(
    initialListing?.category_id ?? categories[0]?.id ?? 1
  );
  const [priceStr, setPriceStr] = useState(
    initialListing?.price != null ? String(initialListing.price) : ""
  );
  const [rentPeriod, setRentPeriod] = useState<RentPeriod>(
    initialListing?.rent_period ?? "day"
  );
  const [depositStr, setDepositStr] = useState(
    initialListing?.deposit != null ? String(initialListing.deposit) : ""
  );
  const [condition, setCondition] = useState<ItemCondition>(
    initialListing?.condition ?? "good"
  );
  const [pickupArea, setPickupArea] = useState(
    initialListing?.pickup_area ?? ""
  );

  const [photos, setPhotos] = useState<PhotoSlot[]>(() =>
    (initialListing?.image_paths ?? []).map((p) => ({
      id: p,
      previewUrl: "",
      existingPath: p,
      progress: 100,
      uploading: false,
    }))
  );
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stamped, setStamped] = useState(false);

  const maxPhotos = kind === "wanted" ? 1 : 4;
  const activePhotos = photos.slice(0, maxPhotos);

  function handleAddFiles(fileList: FileList) {
    const remaining = maxPhotos - activePhotos.length;
    const files = Array.from(fileList).slice(0, remaining);
    const nextSlots: PhotoSlot[] = files.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      file,
      progress: 0,
      uploading: false,
    }));
    setPhotos((prev) => [...prev.slice(0, maxPhotos), ...nextSlots]);
  }

  function handleRemovePhoto(slotId: string) {
    setPhotos((prev) => {
      const target = prev.find((item) => item.id === slotId);
      if (target?.existingPath) {
        setRemovedPaths((old) => [...old, target.existingPath!]);
      }
      return prev.filter((item) => item.id !== slotId);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const parsedPrice =
      kind === "giveaway"
        ? null
        : priceStr.trim() === ""
          ? kind === "rent"
            ? 0
            : null
          : Number.parseInt(priceStr, 10);

    const parsedDeposit =
      kind === "rent" && depositStr.trim() !== ""
        ? Number.parseInt(depositStr, 10)
        : null;

    const result = listingSchema.safeParse({
      kind,
      title,
      description,
      categoryId,
      price: Number.isNaN(parsedPrice as number) ? null : parsedPrice,
      rentPeriod: kind === "rent" ? rentPeriod : null,
      deposit: Number.isNaN(parsedDeposit as number) ? null : parsedDeposit,
      condition: kind === "wanted" ? null : condition,
      pickupArea,
    });

    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const listingId = initialListing?.id ?? crypto.randomUUID();
      const uploadedPaths: string[] = [];

      for (let i = 0; i < activePhotos.length; i++) {
        const slot = activePhotos[i];
        if (slot.existingPath) {
          uploadedPaths.push(slot.existingPath);
          continue;
        }
        if (slot.file) {
          setPhotos((prev) =>
            prev.map((item) =>
              item.id === slot.id ? { ...item, uploading: true, progress: 5 } : item
            )
          );
          const slotNumber = i + 1 + Math.floor(Date.now() % 1000);
          const mainPath = await compressAndUploadPhoto({
            supabase,
            file: slot.file,
            userId,
            listingId,
            slotIndex: slotNumber,
            onProgress: (pct) => {
              setPhotos((prev) =>
                prev.map((item) =>
                  item.id === slot.id ? { ...item, progress: pct } : item
                )
              );
            },
          });
          setPhotos((prev) =>
            prev.map((item) =>
              item.id === slot.id
                ? { ...item, uploading: false, progress: 100, existingPath: mainPath }
                : item
            )
          );
          uploadedPaths.push(mainPath);
        }
      }

      if (removedPaths.length > 0) {
        await supabase.storage
          .from("listing-images")
          .remove(getStoragePathsWithThumbs(removedPaths));
      }

      const payload = {
        kind: result.data.kind,
        title: result.data.title,
        description: result.data.description,
        category_id: result.data.categoryId,
        price: result.data.price,
        rent_period: result.data.rentPeriod,
        deposit: result.data.deposit,
        condition: result.data.condition,
        pickup_area: result.data.pickupArea || null,
        image_paths: uploadedPaths,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("listings")
          .update(payload)
          .eq("id", listingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("listings").insert({
          id: listingId,
          owner_id: userId,
          ...payload,
        });
        if (error) throw error;
      }

      setStamped(true);
      toast.success("Posted");
      window.setTimeout(
        () => {
          router.push(`/listings/${listingId}`);
          router.refresh();
        },
        shouldReduceMotion ? 80 : 650
      );
    } catch (err) {
      setServerError(mapDatabaseError(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <AnimatePresence>
        {stamped && (
          <motion.div
            initial={
              shouldReduceMotion ? { opacity: 1 } : { scale: 1.8, rotate: -12, opacity: 0 }
            }
            animate={{ scale: 1, rotate: -6, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 360, damping: 20 }
            }
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-xs"
          >
            <PriceTag
              kind="sell"
              customText="Posted"
              size="lg"
              className="px-8 py-3 text-2xl shadow-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8"
      >
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <Label>Listing kind</Label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {KIND_OPTIONS.map((opt) => {
              const active = kind === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  className={cn(
                    "relative flex min-h-16 flex-col items-start justify-between rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-primary bg-primary/8 ring-2 ring-primary"
                      : "border-border bg-background/50 hover:bg-muted/60"
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="font-display text-sm font-bold text-foreground">
                      {opt.label}
                    </span>
                    {active && (
                      <motion.span
                        initial={shouldReduceMotion ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 18 }
                        }
                        className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="size-3 stroke-[3]" />
                      </motion.span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                kind === "wanted"
                  ? "Looking for an iron box"
                  : "Study table with foldable legs"
              }
              maxLength={80}
              className="h-11 rounded-xl"
              aria-invalid={!!fieldErrors.title}
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {kind !== "wanted" && (
            <div className="space-y-1.5">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {kind !== "giveaway" && (
            <motion.div
              key={`pricing-${kind}`}
              layout={!shouldReduceMotion}
              initial={shouldReduceMotion ? false : { opacity: 0, scaleY: 0.96 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.96 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              style={{ transformOrigin: "top" }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="price">
                  {kind === "sell"
                    ? "Price (₹)"
                    : kind === "rent"
                      ? "Rent in ₹ (0 to lend free)"
                      : "Max budget in ₹ (optional)"}
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  placeholder={kind === "rent" ? "20" : "600"}
                  className="h-11 rounded-xl"
                  aria-invalid={!!fieldErrors.price}
                />
                {fieldErrors.price && (
                  <p className="text-xs text-destructive">{fieldErrors.price}</p>
                )}
              </div>

              {kind === "rent" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="rentPeriod">Rent period</Label>
                    <select
                      id="rentPeriod"
                      value={rentPeriod}
                      onChange={(e) => setRentPeriod(e.target.value as RentPeriod)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {PERIOD_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deposit">Deposit in ₹ (optional)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={depositStr}
                      onChange={(e) => setDepositStr(e.target.value)}
                      placeholder="200"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description {kind === "wanted" ? "(required)" : "(optional)"}
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share details like brand, size, or how long you used it."
            maxLength={1000}
            rows={4}
            className="rounded-xl"
            aria-invalid={!!fieldErrors.description}
          />
          {fieldErrors.description && (
            <p className="text-xs text-destructive">{fieldErrors.description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pickupArea">Pickup area on campus (optional)</Label>
          <Input
            id="pickupArea"
            value={pickupArea}
            onChange={(e) => setPickupArea(e.target.value)}
            placeholder="Block 5 food court (never write exact room numbers)"
            maxLength={60}
            className="h-11 rounded-xl"
          />
        </div>

        <PhotoPicker
          photos={activePhotos}
          maxPhotos={maxPhotos}
          disabled={submitting}
          onAddFiles={handleAddFiles}
          onRemovePhoto={handleRemovePhoto}
        />

        <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">
            Community rules reminder:
          </strong>{" "}
          Do not post alcohol, tobacco or vapes, drugs, weapons, stolen goods,
          prescription medicines, adult content, live animals, or anything banned
          by campus policy. Meet in public campus areas. No payments happen in
          this app.{" "}
          <Link href="/rules" className="underline underline-offset-4">
            Read full rules
          </Link>
          .
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-xl bg-gold font-display text-base font-bold text-gold-ink hover:bg-gold/90 active:scale-98"
        >
          {submitting
            ? "Uploading and saving..."
            : isEditing
              ? "Save changes"
              : "Post"}
        </Button>
      </form>
    </div>
  );
}
