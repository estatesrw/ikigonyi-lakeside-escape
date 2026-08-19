import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { formatMoney, todayISO } from "@/lib/property";
import { label } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fld, Picker } from "./dashboard.bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/dashboard/pricing")({
  component: PricingPage,
});

const RULE_TYPES = ["base", "weekend", "seasonal", "override"] as const;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Rule = {
  id?: string;
  name?: string;
  rule_type?: string;
  nightly_rate?: number;
  start_date?: string | null;
  end_date?: string | null;
  days_of_week?: number[] | null;
  min_nights?: number | null;
  priority?: number;
  is_active?: boolean;
};

function PricingPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Rule | null>(null);
  const [preview, setPreview] = useState({ from: todayISO(1), to: todayISO(4), guests: 2 });

  const { data, isLoading } = useQuery({
    queryKey: ["pricing_rules", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .eq("property_id", property!.id)
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as unknown as Required<Rule>[];
    },
  });

  const { data: quote } = useQuery({
    queryKey: ["quote-preview", property?.id, preview],
    enabled: !!property && preview.from < preview.to,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("quote_stay", {
        _property_id: property!.id,
        _check_in: preview.from,
        _check_out: preview.to,
        _guests: preview.guests,
      });
      if (error) throw error;
      return data as unknown as {
        available: boolean;
        nights: number;
        total: number;
        currency: string;
        average_nightly: number;
      };
    },
  });

  const save = useMutation({
    mutationFn: async (row: Rule) => {
      const payload = {
        property_id: property!.id,
        name: row.name ?? "",
        rule_type: (row.rule_type ?? "seasonal") as never,
        nightly_rate: Number(row.nightly_rate ?? 0),
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        days_of_week: row.days_of_week?.length ? row.days_of_week : null,
        min_nights: Number(row.min_nights ?? 1),
        priority: Number(row.priority ?? 10),
        is_active: row.is_active ?? true,
      };
      const { error } = row.id
        ? await supabase.from("pricing_rules").update(payload).eq("id", row.id)
        : await supabase.from("pricing_rules").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pricing rule saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["pricing_rules"] });
      qc.invalidateQueries({ queryKey: ["quote-preview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rule deleted");
      qc.invalidateQueries({ queryKey: ["pricing_rules"] });
    },
  });

  if (isLoading) return <Loading />;
  const rows = data ?? [];

  return (
    <div>
      <PageTitle
        title="Pricing"
        description="Rules drive live quotes on the website. Highest priority match wins."
        action={
          access.canManage && (
            <Button
              onClick={() =>
                setEditing({ rule_type: "seasonal", priority: 20, is_active: true, nightly_rate: 0 })
              }
            >
              <Plus className="mr-2 size-4" /> New rule
            </Button>
          )
        }
      />

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Rate preview</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Fld label="Check-in">
            <Input
              type="date"
              value={preview.from}
              onChange={(e) => setPreview({ ...preview, from: e.target.value })}
            />
          </Fld>
          <Fld label="Check-out">
            <Input
              type="date"
              value={preview.to}
              onChange={(e) => setPreview({ ...preview, to: e.target.value })}
            />
          </Fld>
          <Fld label="Guests">
            <Input
              type="number"
              min={1}
              className="w-24"
              value={preview.guests}
              onChange={(e) => setPreview({ ...preview, guests: Number(e.target.value) })}
            />
          </Fld>
          <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm">
            {quote ? (
              quote.available ? (
                <>
                  <span className="font-medium">
                    {formatMoney(Number(quote.total), quote.currency)}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    · {quote.nights} nights · avg{" "}
                    {formatMoney(Number(quote.average_nightly), quote.currency)}/night
                  </span>
                </>
              ) : (
                <span className="text-destructive">Not available for these dates</span>
              )
            ) : (
              <span className="text-muted-foreground">Choose dates</span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No pricing rules" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Applies</TableHead>
                <TableHead>Min nights</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{label(r.rule_type)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(Number(r.nightly_rate), property?.currency ?? "USD")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.start_date ? `${r.start_date} → ${r.end_date}` : "Any dates"}
                    {r.days_of_week?.length
                      ? ` · ${r.days_of_week.map((d) => DOW[d - 1]).join(", ")}`
                      : ""}
                  </TableCell>
                  <TableCell>{r.min_nights ?? "—"}</TableCell>
                  <TableCell>{r.priority}</TableCell>
                  <TableCell>{r.is_active ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    {access.canManage && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                          Edit
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete rule"
                          onClick={() => remove.mutate(r.id)}
                        >
                          <Trash2 className="size-4" />
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
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit rule" : "New pricing rule"}</DialogTitle>
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
              <Fld label="Type">
                <Picker
                  value={editing.rule_type ?? "seasonal"}
                  options={RULE_TYPES}
                  onChange={(v) => setEditing({ ...editing, rule_type: v })}
                />
              </Fld>
              <Fld label="Nightly rate">
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={editing.nightly_rate ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, nightly_rate: Number(e.target.value) })
                  }
                />
              </Fld>
              <Fld label="Start date">
                <Input
                  type="date"
                  value={editing.start_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, start_date: e.target.value })}
                />
              </Fld>
              <Fld label="End date">
                <Input
                  type="date"
                  value={editing.end_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
                />
              </Fld>
              <Fld label="Days of week" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {DOW.map((d, i) => {
                    const value = i + 1;
                    const on = editing.days_of_week?.includes(value) ?? false;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const current = editing.days_of_week ?? [];
                          setEditing({
                            ...editing,
                            days_of_week: on
                              ? current.filter((v) => v !== value)
                              : [...current, value],
                          });
                        }}
                        className={
                          "rounded-full border px-3 py-1 text-xs transition-colors " +
                          (on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border")
                        }
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </Fld>
              <Fld label="Minimum nights">
                <Input
                  type="number"
                  min={0}
                  value={editing.min_nights ?? 0}
                  onChange={(e) => setEditing({ ...editing, min_nights: Number(e.target.value) })}
                />
              </Fld>
              <Fld label="Priority">
                <Input
                  type="number"
                  value={editing.priority ?? 10}
                  onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) })}
                />
              </Fld>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={editing.is_active ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <span className="text-sm">Rule is active</span>
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending}>
                  Save rule
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
