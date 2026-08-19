export const BOOKING_STATUSES = [
  "inquiry",
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "partially_paid", "refunded"] as const;
export const BOOKING_SOURCES = [
  "direct_website",
  "whatsapp",
  "instagram",
  "airbnb",
  "booking_com",
  "expedia",
  "other",
] as const;
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "negotiating",
  "awaiting_payment",
  "confirmed",
  "lost",
  "completed",
] as const;
export const EVENT_TYPES = [
  "bbq",
  "brunch",
  "private_party",
  "birthday",
  "corporate_retreat",
  "celebration",
  "other",
] as const;
export const EVENT_STATUSES = ["planning", "confirmed", "completed", "cancelled"] as const;

export function label(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace("Booking Com", "Booking.com")
    .replace("Bbq", "BBQ");
}
