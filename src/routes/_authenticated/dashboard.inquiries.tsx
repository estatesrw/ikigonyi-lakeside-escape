import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { usePropertyId } from "@/lib/dashboard";
import { LEAD_STATUSES, label } from "@/lib/labels";
import { formatMoney } from "@/lib/property";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchQuote, type Quote } from "@/components/site/BookingSearch";
import { todayISO } from "@/lib/property";
import { useAccess } from "@/lib/dashboard";
import { Fld, Picker } from "./dashboard.bookings";

export const Route = createFileRoute("/_authenticated/dashboard/inquiries")({
  component: InquiriesPage,
});

const PIPELINE = ["new", "contacted", "negotiating", "awaiting_payment", "confirmed"] as const;

type Inquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  interest: string | null;
  check_in: string | null;
  check_out: string | null;
  guests_count: number | null;
  estimated_value: number | null;
  status: string;
  notes: string | null;
  created_at: string;
};

function InquiriesPage() {
  const { data: property } = usePropertyId();
  const qc = useQueryClient();
  const access = useAccess();
  const [active, setActive] = useState<Inquiry | null>(null);
  const [convert, setConvert] = useState<{
    inquiry: Inquiry;
    checkIn: string;
    checkOut: string;
    guests: number;
    status: "pending" | "confirmed";
  } | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["inquiries", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("property_id", property!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Inquiry[];
    },
  });

  const update = useMutation({
    mutationFn: async (row: Inquiry) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ status: row.status as never, notes: row.notes })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inquiry updated");
      setActive(null);
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkQuote = useMutation({
    mutationFn: async () => {
      if (!convert || !property) throw new Error("Missing property");
      return fetchQuote(property.id, convert.checkIn, convert.checkOut, convert.guests);
    },
    onSuccess: setQuote,
    onError: (e: Error) => toast.error(e.message),
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      if (!convert) throw new Error("No inquiry");
      const { data, error } = await supabase.rpc("convert_inquiry_to_booking", {
        _inquiry_id: convert.inquiry.id,
        _check_in: convert.checkIn,
        _check_out: convert.checkOut,
        _guests: convert.guests,
        _status: convert.status,
      });
      if (error) throw error;
      const result = data as unknown as { error?: string; reference: string };
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (r) => {
      toast.success(`Booking ${r.reference} created`);
      setConvert(null);
      setQuote(null);
      setActive(null);
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startConvert = (i: Inquiry) => {
    setQuote(null);
    setConvert({
      inquiry: i,
      checkIn: i.check_in ?? todayISO(7),
      checkOut: i.check_out ?? todayISO(9),
      guests: i.guests_count ?? 2,
      status: "confirmed",
    });
  };

  if (isLoading) return <Loading />;
  const rows = data ?? [];

  return (
    <div>
      <PageTitle
        title="Inquiries"
        description="Lead pipeline from the website, WhatsApp and social channels."
      />

      {rows.length === 0 ? (
        <EmptyState title="No inquiries yet" body="Website enquiries land here automatically." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((stage) => {
            const items = rows.filter((r) => r.status === stage);
            return (
              <div key={stage} className="rounded-xl border border-border bg-card p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-medium">{label(stage)}</h2>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setActive(i)}
                      className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40"
                    >
                      <p className="text-sm font-medium">{i.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {i.interest ?? label(i.source)}
                      </p>
                      {i.check_in && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {i.check_in} → {i.check_out}
                        </p>
                      )}
                      {i.estimated_value ? (
                        <p className="mt-1 text-xs font-medium">
                          {formatMoney(Number(i.estimated_value))}
                        </p>
                      ) : null}
                    </button>
                  ))}
                  {items.length === 0 && (
                    <p className="px-1 py-3 text-xs text-muted-foreground">Nothing here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.name}</DialogTitle>
          </DialogHeader>
          {active && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate(active);
              }}
            >
              <div className="rounded-lg bg-muted/60 p-3 text-sm">
                <p>{active.email ?? "No email"}</p>
                <p>{active.phone ?? "No phone"}</p>
                <p className="mt-2 text-muted-foreground">
                  {label(active.source)}
                  {active.check_in ? ` · ${active.check_in} → ${active.check_out}` : ""}
                  {active.guests_count ? ` · ${active.guests_count} guests` : ""}
                </p>
                {active.interest && <p className="mt-2">{active.interest}</p>}
              </div>
              <Fld label="Status">
                <Picker
                  value={active.status}
                  options={LEAD_STATUSES}
                  onChange={(v) => setActive({ ...active, status: v })}
                />
              </Fld>
              <Fld label="Internal notes">
                <Textarea
                  rows={4}
                  value={active.notes ?? ""}
                  onChange={(e) => setActive({ ...active, notes: e.target.value })}
                />
              </Fld>
              <DialogFooter>
                <Button type="submit" disabled={update.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
