import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { CalendarDays, CheckCircle2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fetchQuote, type Quote } from "@/components/site/BookingSearch";
import { formatMoney, todayISO, useProperty } from "@/lib/property";

const DESCRIPTION =
  "Check availability and request your stay at Ikigonyi Round House, a private lakeside retreat on Lake Muhazi, Rwanda.";

const searchSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().optional(),
});

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book Your Stay — Ikigonyi Round House, Lake Muhazi" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Book Your Stay — Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const search = Route.useSearch();
  const { data: property } = useProperty();

  const [checkIn, setCheckIn] = useState(search.checkIn ?? todayISO(7));
  const [checkOut, setCheckOut] = useState(search.checkOut ?? todayISO(9));
  const [guests, setGuests] = useState(search.guests ?? 4);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", requests: "" });
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    total: string;
    nights: string;
    currency: string;
  } | null>(null);

  const quoteMutation = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Property unavailable");
      return fetchQuote(property.id, checkIn, checkOut, guests);
    },
    onSuccess: setQuote,
    onError: () => toast.error("We couldn't check those dates."),
  });

  useEffect(() => {
    if (property && !quote) quoteMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  const submit = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Property unavailable");
      const { data, error } = await supabase.rpc("create_booking_request", {
        _property_id: property.id,
        _check_in: checkIn,
        _check_out: checkOut,
        _guests: guests,
        _name: form.name,
        _email: form.email,
        _phone: form.phone,
        ...(form.requests ? { _requests: form.requests } : {}),
      });
      if (error) throw error;
      const result = data as unknown as {
        error?: string;
        reference: string;
        total: string;
        nights: string;
        currency: string;
      };
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (r) => setConfirmation(r),
    onError: (e: Error) => toast.error(e.message || "Something went wrong."),
  });

  if (confirmation) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-5 py-24 text-center md:px-8">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <h1 className="display mt-6 text-4xl">Your request is with us.</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Reference <strong className="text-foreground">{confirmation.reference}</strong>. We've
            recorded your dates and our team will confirm availability and payment details with you
            shortly. Your booking is confirmed once a manager confirms it.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
            <Row label="Dates" value={`${checkIn} → ${checkOut}`} />
            <Row label="Nights" value={confirmation.nights} />
            <Row label="Guests" value={String(guests)} />
            <Row
              label="Estimated total"
              value={formatMoney(Number(confirmation.total), confirmation.currency)}
            />
          </div>
        </section>
      </SiteLayout>
    );
  }

  const canSubmit =
    quote?.available && quote.guests_ok && form.name.trim().length > 1 && (form.email || form.phone);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Booking"
        title="Book your stay."
        intro="Choose your dates, review the summary and send your request. We'll confirm availability and payment details directly with you."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 md:grid-cols-[1.2fr_1fr] md:px-8">
        <div className="space-y-8">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="display text-2xl">1. Your dates</h2>
            <form
              className="mt-6 grid gap-4 sm:grid-cols-3"
              onSubmit={(e) => {
                e.preventDefault();
                quoteMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="ci" className="eyebrow">
                  Check-in
                </Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="ci"
                    type="date"
                    className="h-12 pl-9"
                    min={todayISO()}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      setQuote(null);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="co" className="eyebrow">
                  Check-out
                </Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="co"
                    type="date"
                    className="h-12 pl-9"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setQuote(null);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g" className="eyebrow">
                  Guests
                </Label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="g"
                    type="number"
                    min={1}
                    max={property?.max_guests ?? 12}
                    className="h-12 pl-9"
                    value={guests}
                    onChange={(e) => {
                      setGuests(Number(e.target.value));
                      setQuote(null);
                    }}
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="outline"
                className="h-12 rounded-full sm:col-span-3"
                disabled={quoteMutation.isPending}
              >
                {quoteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Check availability & price
              </Button>
            </form>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="display text-2xl">2. Your details</h2>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="req">Special requests</Label>
                <Textarea
                  id="req"
                  rows={4}
                  value={form.requests}
                  onChange={(e) => setForm({ ...form, requests: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full rounded-full"
                disabled={!canSubmit || submit.isPending}
              >
                {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Send booking request
              </Button>
              {!quote?.available && quote && (
                <p className="text-sm text-destructive">
                  Those dates aren't available — please adjust them above.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Payments are made directly to the property owner. No payment is taken on this site.
              </p>
            </form>
          </div>
        </div>

        <aside className="h-fit overflow-hidden rounded-3xl border border-border bg-card md:sticky md:top-28">
          <img
            src={photos.terrace}
            alt="Terrace at Ikigonyi Round House"
            loading="lazy"
            width={1280}
            height={960}
            className="aspect-16/10 w-full object-cover"
          />
          <div className="p-6">
            <h2 className="display text-2xl">Booking summary</h2>
            {quote && !quote.error ? (
              <div className="mt-5 space-y-1">
                <Row label="Dates" value={`${checkIn} → ${checkOut}`} />
                <Row label="Nights" value={String(quote.nights)} />
                <Row label="Guests" value={String(guests)} />
                <Row
                  label="Avg nightly rate"
                  value={formatMoney(Number(quote.avg_nightly), quote.currency)}
                />
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="eyebrow">Total</span>
                  <span className="display text-3xl">
                    {formatMoney(Number(quote.total), quote.currency)}
                  </span>
                </div>
                <p
                  className={
                    quote.available
                      ? "mt-3 text-sm text-primary"
                      : "mt-3 text-sm text-destructive"
                  }
                >
                  {quote.available ? "Available for your dates" : "Not available for these dates"}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Check your dates to see nights, nightly rate and total.
              </p>
            )}
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
