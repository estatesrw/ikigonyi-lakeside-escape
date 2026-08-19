import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { formatMoney } from "@/lib/property";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/dashboard/guests")({
  component: GuestsPage,
});

function GuestsPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["guests", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("guest_name,guest_email,guest_phone,check_in,check_out,total_amount,currency,status")
        .eq("property_id", property!.id)
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Loading />;

  const guests = Object.values(
    (data ?? []).reduce<
      Record<
        string,
        {
          name: string;
          email: string | null;
          phone: string | null;
          stays: number;
          spend: number;
          last: string;
          currency: string;
        }
      >
    >((acc, b) => {
      const key = (b.guest_email ?? b.guest_phone ?? b.guest_name).toLowerCase();
      const existing = acc[key];
      const spend = ["confirmed", "completed"].includes(b.status) ? Number(b.total_amount) : 0;
      if (existing) {
        existing.stays += 1;
        existing.spend += spend;
        if (b.check_in > existing.last) existing.last = b.check_in;
      } else {
        acc[key] = {
          name: b.guest_name,
          email: b.guest_email,
          phone: b.guest_phone,
          stays: 1,
          spend,
          last: b.check_in,
          currency: b.currency,
        };
      }
      return acc;
    }, {}),
  ).sort((a, b) => b.last.localeCompare(a.last));

  const filtered = guests.filter((g) =>
    `${g.name} ${g.email ?? ""} ${g.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageTitle title="Guests" description="Everyone who has stayed or requested a stay." />
      <Input
        placeholder="Search guests…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 max-w-sm"
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No guests yet" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stays</TableHead>
                {access.canSeeFinancials && <TableHead>Lifetime value</TableHead>}
                <TableHead>Most recent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => (
                <TableRow key={g.name + g.last}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {g.email ?? "—"}
                    {g.phone ? ` · ${g.phone}` : ""}
                  </TableCell>
                  <TableCell>{g.stays}</TableCell>
                  {access.canSeeFinancials && (
                    <TableCell className="tabular-nums">
                      {formatMoney(g.spend, g.currency)}
                    </TableCell>
                  )}
                  <TableCell>{g.last}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
