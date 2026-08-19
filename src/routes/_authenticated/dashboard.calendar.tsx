import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loading, PageTitle, StatusBadge } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fld } from "./dashboard.bookings";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/property";

export const Route = createFileRoute("/_authenticated/dashboard/calendar")({
  component: CalendarPage,
});

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function CalendarPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState<{ start: string; end: string; reason: string } | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const [bookings, blocks, events] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("property_id", property!.id)
          .in("status", ["confirmed", "pending"]),
        supabase.from("blocked_dates").select("*").eq("property_id", property!.id),
        supabase.from("events").select("*").eq("property_id", property!.id),
      ]);
      if (bookings.error) throw bookings.error;
      if (blocks.error) throw blocks.error;
      if (events.error) throw events.error;
      return { bookings: bookings.data, blocks: blocks.data, events: events.data };
    },
  });

  const addBlock = useMutation({
    mutationFn: async (f: { start: string; end: string; reason: string }) => {
      const { error } = await supabase.from("blocked_dates").insert({
        property_id: property!.id,
        start_date: f.start,
        end_date: f.end,
        reason: f.reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dates blocked");
      setBlockForm(null);
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Block removed");
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  if (isLoading || !data) return <Loading />;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // Monday-first
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => iso(new Date(year, month, i + 1))),
  ];

  const bookingOn = (day: string) =>
    data.bookings.find((b) => b.check_in <= day && b.check_out > day);
  const blockOn = (day: string) =>
    data.blocks.find((b) => b.start_date <= day && b.end_date > day);
  const eventsOn = (day: string) => data.events.filter((e) => e.event_date === day);

  const selectedBooking = selected ? bookingOn(selected) : null;
  const selectedBlock = selected ? blockOn(selected) : null;

  return (
    <div>
      <PageTitle
        title="Calendar"
        description="Bookings, blocked dates and events. Confirmed bookings block availability."
        action={
          access.canManage && (
            <Button
              onClick={() =>
                setBlockForm({ start: iso(new Date()), end: iso(new Date()), reason: "" })
              }
            >
              Block dates
            </Button>
          )
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {first.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Next month"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const booking = bookingOn(day);
            const block = blockOn(day);
            const evs = eventsOn(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(day)}
                className={cn(
                  "min-h-20 rounded-lg border p-2 text-left text-xs transition-colors",
                  booking?.status === "confirmed"
                    ? "border-primary/30 bg-primary/10"
                    : booking
                      ? "border-accent/30 bg-accent/10"
                      : block
                        ? "border-destructive/25 bg-destructive/10"
                        : "border-border hover:bg-muted",
                )}
              >
                <span className="font-medium">{Number(day.slice(-2))}</span>
                {booking && <p className="mt-1 truncate">{booking.guest_name}</p>}
                {block && !booking && <p className="mt-1 truncate">Blocked</p>}
                {evs.map((e) => (
                  <p key={e.id} className="mt-1 truncate text-accent">
                    ● {e.name}
                  </p>
                ))}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Legend className="bg-primary/25" text="Confirmed booking" />
          <Legend className="bg-accent/30" text="Pending booking" />
          <Legend className="bg-destructive/25" text="Blocked" />
          <Legend className="bg-muted" text="Available" />
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected}</DialogTitle>
          </DialogHeader>
          {selectedBooking ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedBooking.guest_name}</span>
                <StatusBadge value={selectedBooking.status} />
              </div>
              <p className="text-muted-foreground">
                {selectedBooking.check_in} → {selectedBooking.check_out} ·{" "}
                {selectedBooking.guests_count} guests
              </p>
              {access.canSeeFinancials && (
                <p className="text-muted-foreground">
                  Total{" "}
                  {formatMoney(Number(selectedBooking.total_amount), selectedBooking.currency)}
                </p>
              )}
              <p className="font-mono text-xs text-muted-foreground">
                {selectedBooking.reference}
              </p>
            </div>
          ) : selectedBlock ? (
            <div className="space-y-3 text-sm">
              <p>
                Blocked: {selectedBlock.start_date} → {selectedBlock.end_date}
              </p>
              <p className="text-muted-foreground">{selectedBlock.reason ?? "No reason given"}</p>
              {access.canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    removeBlock.mutate(selectedBlock.id);
                    setSelected(null);
                  }}
                >
                  Remove block
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">This date is available.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!blockForm} onOpenChange={(o) => !o && setBlockForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block dates</DialogTitle>
          </DialogHeader>
          {blockForm && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                addBlock.mutate(blockForm);
              }}
            >
              <Fld label="From">
                <Input
                  type="date"
                  required
                  value={blockForm.start}
                  onChange={(e) => setBlockForm({ ...blockForm, start: e.target.value })}
                />
              </Fld>
              <Fld label="To (exclusive)">
                <Input
                  type="date"
                  required
                  value={blockForm.end}
                  onChange={(e) => setBlockForm({ ...blockForm, end: e.target.value })}
                />
              </Fld>
              <Fld label="Reason">
                <Input
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                />
              </Fld>
              <DialogFooter>
                <Button type="submit" disabled={addBlock.isPending}>
                  Block dates
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Legend({ className, text }: { className: string; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("size-3 rounded", className)} /> {text}
    </span>
  );
}
