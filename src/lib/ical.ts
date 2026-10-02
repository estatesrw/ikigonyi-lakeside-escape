// Minimal iCal helpers shared by the export feed and import sync.

export type IcalEvent = { uid: string; start: string; end: string; summary: string };

function toIsoDate(v: string): string | null {
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export function parseIcal(text: string): IcalEvent[] {
  // Unfold folded lines (RFC 5545)
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const events: IcalEvent[] = [];
  let cur: Partial<IcalEvent> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur?.start && cur.end) {
        events.push({
          uid: cur.uid ?? `${cur.start}-${cur.end}`,
          start: cur.start,
          end: cur.end,
          summary: cur.summary ?? "Reserved",
        });
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const key = line.slice(0, idx).split(";")[0].toUpperCase();
      const val = line.slice(idx + 1).trim();
      if (key === "DTSTART") cur.start = toIsoDate(val) ?? undefined;
      else if (key === "DTEND") cur.end = toIsoDate(val) ?? undefined;
      else if (key === "UID") cur.uid = val;
      else if (key === "SUMMARY") cur.summary = val;
    }
  }
  return events;
}

const fmt = (d: string) => d.replaceAll("-", "");

export function buildIcal(name: string, events: IcalEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const body = events
    .map((e) =>
      [
        "BEGIN:VEVENT",
        `UID:${e.uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${fmt(e.start)}`,
        `DTEND;VALUE=DATE:${fmt(e.end)}`,
        `SUMMARY:${e.summary}`,
        "END:VEVENT",
      ].join("\r\n"),
    )
    .join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ikigonyi Round House//Calendar//EN",
    `X-WR-CALNAME:${name}`,
    "CALSCALE:GREGORIAN",
    body,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
