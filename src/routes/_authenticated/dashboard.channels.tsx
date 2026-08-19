import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle, StatusBadge } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { label } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fld, Picker } from "./dashboard.bookings";

export const Route = createFileRoute("/_authenticated/dashboard/channels")({
  component: ChannelsPage,
});

const STATUSES = ["not_connected", "connected", "paused"] as const;

type Channel = {
  id: string;
  name: string;
  code: string;
  status: string;
  ical_import_url: string | null;
  ical_export_url: string | null;
  last_synced_at: string | null;
};

function ChannelsPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Channel | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["channels", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("property_id", property!.id)
        .order("name");
      if (error) throw error;
      return data as unknown as Channel[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Channel) => {
      const { error } = await supabase
        .from("channels")
        .update({
          status: row.status as never,
          ical_import_url: row.ical_import_url || null,
          ical_export_url: row.ical_export_url || null,
        })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Channel updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loading />;
  const rows = data ?? [];

  return (
    <div>
      <PageTitle
        title="Channels"
        description="Track where bookings come from and keep calendars in sync via iCal."
      />
      {rows.length === 0 ? (
        <EmptyState title="No channels configured" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">{label(c.code)}</p>
                </div>
                <StatusBadge value={c.status} />
              </div>
              <p className="mt-4 truncate text-xs text-muted-foreground">
                Import: {c.ical_import_url ?? "not set"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last sync: {c.last_synced_at ? new Date(c.last_synced_at).toLocaleString() : "never"}
              </p>
              {access.canManage && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(c)}>
                  Configure
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.name}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              <Fld label="Status">
                <Picker
                  value={editing.status}
                  options={STATUSES}
                  onChange={(v) => setEditing({ ...editing, status: v })}
                />
              </Fld>
              <Fld label="iCal import URL">
                <Input
                  value={editing.ical_import_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, ical_import_url: e.target.value })}
                />
              </Fld>
              <Fld label="iCal export URL">
                <Input
                  value={editing.ical_export_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, ical_export_url: e.target.value })}
                />
              </Fld>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>
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
