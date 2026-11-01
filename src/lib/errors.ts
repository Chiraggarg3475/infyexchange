export function mapDatabaseError(error: unknown): string {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "";

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  const combined = `${message} ${code}`.toLowerCase();

  if (combined.includes("invalid_code")) {
    return "That code isn't valid, has expired or is fully used. Ask your batch coordinator for a new one.";
  }
  if (combined.includes("already_active")) {
    return "already_active";
  }
  if (combined.includes("suspended")) {
    return "suspended";
  }
  if (combined.includes("listing_limit_reached")) {
    return "You can have up to 20 active listings. Close one first.";
  }
  if (combined.includes("23505") || combined.includes("duplicate key")) {
    return "You've already sent a request for this item.";
  }
  if (combined.includes("listing_not_active")) {
    return "This item is no longer available.";
  }
  if (
    combined.includes("forbidden") ||
    combined.includes("row-level security") ||
    combined.includes("42501")
  ) {
    return "You don't have permission to do that.";
  }
  if (combined.includes("name_required")) {
    return "Enter your full name (at least 2 characters).";
  }

  return "Something went wrong. Please try again.";
}
