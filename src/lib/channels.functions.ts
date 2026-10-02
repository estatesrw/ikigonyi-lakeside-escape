import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseIcal } from "@/lib/ical";

// Pull bookings from an Airbnb / Booking.com iCal link and block those dates.
// Runs as the signed-in manager, so RLS decides who may sync.
export const syncChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ channelId: z.string().uuid(), url: z.string().url().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: channel, error } = await sb
      .from("channels")
      .select("id,property_id,name,ical_import_url")
      .eq("id", data.channelId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!channel) throw new Error("Channel not found");
    const url = data.url ?? channel.ical_import_url;
    if (!url || !/^https:\/\//i.test(url)) throw new Error("Add a valid https calendar link first.");

    const res = await fetch(url, { headers: { Accept: "text/calendar" } });
    if (!res.ok) throw new Error(`The calendar link returned an error (${res.status}). Check the link.`);
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("That link is not a calendar (iCal) link.");

    const today = new Date().toISOString().slice(0, 10);
    const events = parseIcal(text).filter((e) => e.end >= today && e.end > e.start);

    const { error: delErr } = await sb.from("blocked_dates").delete().eq("source_channel_id", channel.id);
    if (delErr) throw new Error(delErr.message);
    if (events.length) {
      const { error: insErr } = await sb.from("blocked_dates").insert(
        events.map((e) => ({
          property_id: channel.property_id,
          start_date: e.start,
          end_date: e.end,
          reason: `${channel.name}: ${e.summary}`.slice(0, 200),
          source_channel_id: channel.id,
          external_uid: e.uid,
        })),
      );
      if (insErr) throw new Error(insErr.message);
    }
    const { error: upErr } = await sb
      .from("channels")
      .update({ ical_import_url: url, status: "connected", last_synced_at: new Date().toISOString() })
      .eq("id", channel.id);
    if (upErr) throw new Error(upErr.message);
    return { imported: events.length };
  });
