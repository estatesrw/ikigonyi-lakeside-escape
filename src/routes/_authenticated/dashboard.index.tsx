import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { formatMoney, todayISO } from "@/lib/property";
import { label } from "@/lib/labels";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const today = todayISO();

  const { data, isLoading } = useQuery({
    queryKey: ["overview", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const [bookings, inquiries, events] = await Promise.all([
        supabase.from("bookings").select("*").eq("property_id", property!.id),
        supabase.from("inquiries").select("*").eq("property_id", property!.id).eq("status", "new"),
        supabase
          .from("events")
          .select("*")
          .eq("property_id", property!.id)
          .gte("event_date", today)
          .order("event_date"),
      ]);
      if (bookings.error) throw bookings.error;
      if (inquiries.error) throw inquiries.error;
      if (events.error) throw events.error;
      return {
        bookings: bookings.data ?? [],
        inquiries: inquiries.data ?? [],
        events: events.data ?? [],
      };
    },
  });

  if (isLoading || !data) return <Loading />;

  const bookings = data.bookings;
  const arrivals = bookings.filter((b) => b.check_in === today && b.status === "confirmed");
  const departures = bookings.filter((b) => b.check_out === today && b.status === "confirmed");
  const upcoming = bookings
    .filter((b) => b.check_in >= today && ["confirmed", "pending"].includes(b.status))
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 6);
  const occupiedToday = bookings.some(
    (b) => b.status === "confirmed" && b.check_in <= today && b.check_out > today,
  );
  const revenue = bookings
    .filter((b) => ["confirmed", "completed"].includes(b.status))
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const bySource = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.source] = (acc[b.source] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: label(name), value }));

  const byMonth = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      const key = b.check_in.slice(0, 7);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort()
    .map(([month, count]) => ({ month, count }));

  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <div>
      <PageTitle title="Overview" description="Today at a glance across the property." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's arrivals" value={arrivals.length} />
        <StatCard label="Today's departures" value={departures.length} />
        <StatCard label="Pending inquiries" value={data.inquiries.length} />
        <StatCard label="Occupancy today" value={occupiedToday ? "Occupied" : "Available"} />
        {access.canSeeFinancials && (
          <StatCard
            label="Estimated revenue"
            value={formatMoney(revenue, property?.currency ?? "USD")}
            hint="Confirmed + completed bookings"
          />
        )}
        <StatCard label="Upcoming events" value={data.events.length} />
        <StatCard label="Total bookings" value={bookings.length} />
        <StatCard
          label="Confirmed"
          value={bookings.filter((b) => b.status === "confirmed").length}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Upcoming bookings</h2>
          {upcoming.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No upcoming bookings" />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.guest_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.check_in} → {b.check_out} · {b.guests_count} guests
                    </p>
                  </div>
                  <StatusBadge value={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Upcoming events</h2>
          {data.events.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No events scheduled" />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.events.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.event_date} · {label(e.event_type)}
                    </p>
                  </div>
                  <StatusBadge value={e.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Bookings by month</h2>
          {byMonth.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No data yet" />
            </div>
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Booking sources</h2>
          {bySource.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No data yet" />
            </div>
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                    {bySource.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
