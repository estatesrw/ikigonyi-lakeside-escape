import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle, StatCard } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { formatMoney } from "@/lib/property";
import { label } from "@/lib/labels";

export const Route = createFileRoute("/_authenticated/dashboard/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();

  const { data, isLoading } = useQuery({
    queryKey: ["reports", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in,nights,total_amount,commission_amount,status,source,currency")
        .eq("property_id", property!.id)
        .in("status", ["confirmed", "completed"]);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Loading />;
  if (!access.canSeeFinancials)
    return <EmptyState title="Reports are restricted" body="Ask an owner for access." />;

  const rows = data ?? [];
  const currency = property?.currency ?? "USD";
  const revenue = rows.reduce((s, b) => s + Number(b.total_amount), 0);
  const commission = rows.reduce((s, b) => s + Number(b.commission_amount ?? 0), 0);
  const nights = rows.reduce((s, b) => s + Number(b.nights), 0);
  const adr = nights ? revenue / nights : 0;

  const monthly = Object.entries(
    rows.reduce<Record<string, { revenue: number; nights: number }>>((acc, b) => {
      const key = b.check_in.slice(0, 7);
      acc[key] ??= { revenue: 0, nights: 0 };
      acc[key].revenue += Number(b.total_amount);
      acc[key].nights += Number(b.nights);
      return acc;
    }, {}),
  )
    .sort()
    .map(([month, v]) => ({ month, ...v }));

  const bySource = Object.entries(
    rows.reduce<Record<string, number>>((acc, b) => {
      acc[label(b.source)] = (acc[label(b.source)] ?? 0) + Number(b.total_amount);
      return acc;
    }, {}),
  ).map(([source, revenue]) => ({ source, revenue }));

  return (
    <div>
      <PageTitle title="Reports" description="Revenue performance across confirmed stays." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatMoney(revenue, currency)} />
        <StatCard label="Nights sold" value={nights} />
        <StatCard label="Average daily rate" value={formatMoney(adr, currency)} />
        <StatCard label="Channel commission" value={formatMoney(commission, currency)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Revenue &amp; nights by month</h2>
          {monthly.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No confirmed bookings yet" />
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="nights" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Revenue by channel</h2>
          {bySource.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No data" />
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySource} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="source"
                    width={110}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
