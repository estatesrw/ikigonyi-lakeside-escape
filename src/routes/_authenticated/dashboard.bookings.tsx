import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle, StatusBadge } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { formatMoney, todayISO } from "@/lib/property";
import { BOOKING_SOURCES, BOOKING_STATUSES, PAYMENT_STATUSES, label } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/dashboard/bookings")({
  component: BookingsPage,
});

type BookingRow = {
  id: string;
  reference: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  guests_count: number;
  check_in: string;
  check_out: string;
  nights: number;
  nightly_rate: number;
  total_amount: number;
  currency: string;
  source: string;
  status: string;
  payment_status: string;
  commission_rate: number;
  commission_amount: number;
  special_requests: string | null;
  internal_notes: string | null;
  created_at: string;
};

const FILTERS = ["all", "pending", "confirmed", "cancelled", "completed"] as const;

function BookingsPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [editing, setEditing] = useState<Partial<BookingRow> | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("property_id", property!.id)
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data as unknown as BookingRow[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Partial<BookingRow>) => {
      const payload = {
        property_id: property!.id,
        guest_name: row.guest_name ?? "",
        guest_email: row.guest_email ?? null,
        guest_phone: row.guest_phone ?? null,
        guests_count: Number(row.guests_count ?? 1),
        check_in: row.check_in!,
        check_out: row.check_out!,
        nightly_rate: Number(row.nightly_rate ?? 0),
        total_amount: Number(row.total_amount ?? 0),
        source: (row.source ?? "direct_website") as never,
        status: (row.status ?? "pending") as never,
        payment_status: (row.payment_status ?? "pending") as never,
        commission_rate: Number(row.commission_rate ?? 0),
        commission_amount: Number(row.commission_amount ?? 0),
        special_requests: row.special_requests ?? null,
        internal_notes: row.internal_notes ?? null,
      };
      if (row.id) {
        const { error } = await supabase.from("bookings").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bookings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Booking saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loading />;

  const rows = (bookings ?? []).filter((b) => filter === "all" || b.status === filter);

  return (
    <div>
      <PageTitle
        title="Bookings"
        description="Every stay, from website request to completed booking."
        action={
          access.canManage && (
            <Button
              onClick={() =>
                setEditing({
                  check_in: todayISO(1),
                  check_out: todayISO(3),
                  guests_count: 2,
                  status: "pending",
                  source: "direct_website",
                  payment_status: "pending",
                })
              }
            >
              <Plus className="mr-2 size-4" /> New booking
            </Button>
          )
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {label(f)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No bookings here yet" body="New website requests appear here." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Source</TableHead>
                {access.canSeeFinancials && <TableHead>Total</TableHead>}
                {access.canSeeFinancials && <TableHead>Payment</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.reference}</TableCell>
                  <TableCell>
                    <p className="font-medium">{b.guest_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.guest_email ?? b.guest_phone ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {b.check_in} → {b.check_out}
                  </TableCell>
                  <TableCell>{b.nights}</TableCell>
                  <TableCell>{b.guests_count}</TableCell>
                  <TableCell className="text-sm">{label(b.source)}</TableCell>
                  {access.canSeeFinancials && (
                    <TableCell className="tabular-nums">
                      {formatMoney(Number(b.total_amount), b.currency)}
                    </TableCell>
                  )}
                  {access.canSeeFinancials && (
                    <TableCell>
                      <StatusBadge value={b.payment_status} />
                    </TableCell>
                  )}
                  <TableCell>
                    <StatusBadge value={b.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {access.canManage && (
                      <div className="flex justify-end gap-2">
                        {b.status !== "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStatus.mutate({ id: b.id, status: "confirmed" })}
                          >
                            Confirm
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setEditing(b)}>
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit booking" : "New booking"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              <Fld label="Guest name" className="sm:col-span-2">
                <Input
                  required
                  value={editing.guest_name ?? ""}
                  onChange={(e) => setEditing({ ...editing, guest_name: e.target.value })}
                />
              </Fld>
              <Fld label="Email">
                <Input
                  type="email"
                  value={editing.guest_email ?? ""}
                  onChange={(e) => setEditing({ ...editing, guest_email: e.target.value })}
                />
              </Fld>
              <Fld label="Phone">
                <Input
                  value={editing.guest_phone ?? ""}
                  onChange={(e) => setEditing({ ...editing, guest_phone: e.target.value })}
                />
              </Fld>
              <Fld label="Check-in">
                <Input
                  type="date"
                  required
                  value={editing.check_in ?? ""}
                  onChange={(e) => setEditing({ ...editing, check_in: e.target.value })}
                />
              </Fld>
              <Fld label="Check-out">
                <Input
                  type="date"
                  required
                  value={editing.check_out ?? ""}
                  onChange={(e) => setEditing({ ...editing, check_out: e.target.value })}
                />
              </Fld>
              <Fld label="Guests">
                <Input
                  type="number"
                  min={1}
                  value={editing.guests_count ?? 1}
                  onChange={(e) =>
                    setEditing({ ...editing, guests_count: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Nightly rate">
                <Input
                  type="number"
                  step="0.01"
                  value={editing.nightly_rate ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, nightly_rate: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Total amount">
                <Input
                  type="number"
                  step="0.01"
                  value={editing.total_amount ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, total_amount: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Commission %">
                <Input
                  type="number"
                  step="0.01"
                  value={editing.commission_rate ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, commission_rate: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Source">
                <Picker
                  value={editing.source ?? "direct_website"}
                  options={BOOKING_SOURCES}
                  onChange={(v) => setEditing({ ...editing, source: v })}
                />
              </Fld>
              <Fld label="Status">
                <Picker
                  value={editing.status ?? "pending"}
                  options={BOOKING_STATUSES}
                  onChange={(v) => setEditing({ ...editing, status: v })}
                />
              </Fld>
              <Fld label="Payment status">
                <Picker
                  value={editing.payment_status ?? "pending"}
                  options={PAYMENT_STATUSES}
                  onChange={(v) => setEditing({ ...editing, payment_status: v })}
                />
              </Fld>
              <Fld label="Special requests" className="sm:col-span-2">
                <Textarea
                  rows={2}
                  value={editing.special_requests ?? ""}
                  onChange={(e) => setEditing({ ...editing, special_requests: e.target.value })}
                />
              </Fld>
              <Fld label="Internal notes" className="sm:col-span-2">
                <Textarea
                  rows={2}
                  value={editing.internal_notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, internal_notes: e.target.value })}
                />
              </Fld>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending}>
                  Save booking
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Fld({
  label: text,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-2 " + (className ?? "")}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{text}</Label>
      {children}
    </div>
  );
}

export function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {label(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
