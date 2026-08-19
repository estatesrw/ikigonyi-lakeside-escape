import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle, StatusBadge } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { EVENT_STATUSES, EVENT_TYPES, label } from "@/lib/labels";
import { formatMoney, todayISO } from "@/lib/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fld, Picker } from "./dashboard.bookings";

export const Route = createFileRoute("/_authenticated/dashboard/events")({
  component: EventsPage,
});

type EventRow = {
  id?: string;
  name?: string;
  event_date?: string;
  event_type?: string;
  guests_count?: number;
  expected_revenue?: number;
  estimated_costs?: number;
  vendors?: string | null;
  status?: string;
  notes?: string | null;
};

function EventsPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EventRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["events", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("property_id", property!.id)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as unknown as Required<EventRow>[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: EventRow) => {
      const payload = {
        property_id: property!.id,
        name: row.name ?? "",
        event_date: row.event_date!,
        event_type: (row.event_type ?? "other") as never,
        guests_count: Number(row.guests_count ?? 0),
        expected_revenue: Number(row.expected_revenue ?? 0),
        estimated_costs: Number(row.estimated_costs ?? 0),
        vendors: row.vendors ?? null,
        status: (row.status ?? "planning") as never,
        notes: row.notes ?? null,
      };
      const { error } = row.id
        ? await supabase.from("events").update(payload).eq("id", row.id)
        : await supabase.from("events").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loading />;
  const rows = data ?? [];

  return (
    <div>
      <PageTitle
        title="Events"
        description="Lakeside BBQs, brunches, celebrations and private hires."
        action={
          access.canManage && (
            <Button
              onClick={() =>
                setEditing({ event_date: todayISO(7), event_type: "bbq", status: "planning" })
              }
            >
              <Plus className="mr-2 size-4" /> New event
            </Button>
          )
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="No events yet" body="Plan your first lakeside gathering." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((e) => {
            const margin = Number(e.expected_revenue) - Number(e.estimated_costs);
            return (
              <div key={e.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">{e.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.event_date} · {label(e.event_type)} · {e.guests_count} guests
                    </p>
                  </div>
                  <StatusBadge value={e.status} />
                </div>
                {access.canSeeFinancials && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="tabular-nums">{formatMoney(Number(e.expected_revenue))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Costs</p>
                      <p className="tabular-nums">{formatMoney(Number(e.estimated_costs))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className="tabular-nums font-medium">{formatMoney(margin)}</p>
                    </div>
                  </div>
                )}
                {e.vendors && (
                  <p className="mt-3 text-xs text-muted-foreground">Vendors: {e.vendors}</p>
                )}
                {access.canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setEditing(e)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit event" : "New event"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              <Fld label="Name" className="sm:col-span-2">
                <Input
                  required
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Fld>
              <Fld label="Date">
                <Input
                  type="date"
                  required
                  value={editing.event_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, event_date: e.target.value })}
                />
              </Fld>
              <Fld label="Type">
                <Picker
                  value={editing.event_type ?? "bbq"}
                  options={EVENT_TYPES}
                  onChange={(v) => setEditing({ ...editing, event_type: v })}
                />
              </Fld>
              <Fld label="Guests">
                <Input
                  type="number"
                  min={0}
                  value={editing.guests_count ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, guests_count: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Status">
                <Picker
                  value={editing.status ?? "planning"}
                  options={EVENT_STATUSES}
                  onChange={(v) => setEditing({ ...editing, status: v })}
                />
              </Fld>
              <Fld label="Expected revenue">
                <Input
                  type="number"
                  step="0.01"
                  value={editing.expected_revenue ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, expected_revenue: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Estimated costs">
                <Input
                  type="number"
                  step="0.01"
                  value={editing.estimated_costs ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, estimated_costs: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Vendors" className="sm:col-span-2">
                <Input
                  value={editing.vendors ?? ""}
                  onChange={(e) => setEditing({ ...editing, vendors: e.target.value })}
                />
              </Fld>
              <Fld label="Notes" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </Fld>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending}>
                  Save event
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
