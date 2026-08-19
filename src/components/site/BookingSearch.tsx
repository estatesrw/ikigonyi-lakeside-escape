import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, todayISO, useProperty } from "@/lib/property";
import { cn } from "@/lib/utils";

export type Quote = {
  available: boolean;
  nights: number;
  total: number;
  avg_nightly: number;
  currency: string;
  guests_ok: boolean;
  max_guests: number;
  error?: string;
};

export async function fetchQuote(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
): Promise<Quote> {
  const { data, error } = await supabase.rpc("quote_stay", {
    _property_id: propertyId,
    _check_in: checkIn,
    _check_out: checkOut,
    _guests: guests,
  });
  if (error) throw error;
  return data as unknown as Quote;
}

export function BookingSearch({
  variant = "card",
  onQuote,
}: {
  variant?: "card" | "plain";
  onQuote?: (q: Quote, params: { checkIn: string; checkOut: string; guests: number }) => void;
}) {
  const { data: property } = useProperty();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(todayISO(7));
  const [checkOut, setCheckOut] = useState(todayISO(9));
  const [guests, setGuests] = useState(4);
  const [quote, setQuote] = useState<Quote | null>(null);

  const search = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Property unavailable");
      return fetchQuote(property.id, checkIn, checkOut, guests);
    },
    onSuccess: (q) => {
      setQuote(q);
      onQuote?.(q, { checkIn, checkOut, guests });
    },
  });

  return (
    <div
      className={cn(
        variant === "card"
          ? "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] md:p-7"
          : "",
      )}
    >
      <form
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          search.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="check-in" className="eyebrow">
            Check-in
          </Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="check-in"
              type="date"
              className="h-12 pl-9"
              min={todayISO()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="check-out" className="eyebrow">
            Check-out
          </Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="check-out"
              type="date"
              className="h-12 pl-9"
              min={checkIn}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests" className="eyebrow">
            Guests
          </Label>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="guests"
              type="number"
              min={1}
              max={property?.max_guests ?? 12}
              className="h-12 w-full pl-9 md:w-28"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              required
            />
          </div>
        </div>
        <Button type="submit" className="h-12 rounded-full px-7" disabled={search.isPending}>
          {search.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Check availability
        </Button>
      </form>

      {search.isError && (
        <p className="mt-4 text-sm text-destructive">
          We couldn't check those dates. Please try again.
        </p>
      )}

      {quote && !quote.error && (
        <div className="mt-6 border-t border-border pt-5">
          {!quote.guests_ok ? (
            <p className="text-sm text-destructive">
              Ikigonyi hosts up to {quote.max_guests} guests. Please reduce the number of guests or
              send us an enquiry.
            </p>
          ) : quote.available ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Available for your dates</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {quote.nights} {quote.nights === 1 ? "night" : "nights"} ·{" "}
                  {formatMoney(Number(quote.avg_nightly), quote.currency)} avg / night
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="eyebrow">Total</p>
                  <p className="display text-2xl">
                    {formatMoney(Number(quote.total), quote.currency)}
                  </p>
                </div>
                <Button
                  className="rounded-full px-6"
                  onClick={() =>
                    navigate({
                      to: "/book",
                      search: { checkIn, checkOut, guests },
                    })
                  }
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Those dates are not available. Try nearby dates, or{" "}
              <a className="text-primary underline underline-offset-4" href="/book">
                send us an enquiry
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
