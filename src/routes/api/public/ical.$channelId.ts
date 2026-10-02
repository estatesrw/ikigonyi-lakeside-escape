import { createFileRoute } from "@tanstack/react-router";
import { buildIcal, type IcalEvent } from "@/lib/ical";

// Public calendar feed for Airbnb / Booking.com. The channel id is an unguessable
// UUID acting as the feed token. Only dates are exposed — never guest details.
export const Route = createFileRoute("/api/public/ical/$channelId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.channelId.replace(/\.ics$/, "");
        if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: channel } = await supabaseAdmin
          .from("channels")
          .select("id,property_id,name")
          .eq("id", id)
          .maybeSingle();
        if (!channel) return new Response("Not found", { status: 404 });

        const today = new Date().toISOString().slice(0, 10);
        const [{ data: bookings }, { data: blocks }] = await Promise.all([
          supabaseAdmin
            .from("bookings")
            .select("id,check_in,check_out")
            .eq("property_id", channel.property_id)
            .eq("status", "confirmed")
            .gte("check_out", today),
          supabaseAdmin
            .from("blocked_dates")
            .select("id,start_date,end_date,source_channel_id")
            .eq("property_id", channel.property_id)
            .gte("end_date", today),
        ]);

        const events: IcalEvent[] = [
          ...(bookings ?? []).map((b) => ({
            uid: `booking-${b.id}@ikigonyi.com`,
            start: b.check_in,
            end: b.check_out,
            summary: "Reserved",
          })),
          // Don't echo a channel's own blocks back to it.
          ...(blocks ?? [])
            .filter((b) => b.source_channel_id !== channel.id)
            .map((b) => ({
              uid: `block-${b.id}@ikigonyi.com`,
              start: b.start_date,
              end: b.end_date,
              summary: "Not available",
            })),
        ];

        return new Response(buildIcal(`Ikigonyi – ${channel.name}`, events), {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
