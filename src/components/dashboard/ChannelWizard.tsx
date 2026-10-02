import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { syncChannel } from "@/lib/channels.functions";
import { ASSET_ORIGIN } from "@/lib/photos";

type Ch = { id: string; name: string; code: string; ical_import_url: string | null };

const GUIDES: Record<string, { exportSteps: string[]; importSteps: string[]; hint: string }> = {
  airbnb: {
    importSteps: [
      "Open Airbnb on a computer and go to Listings → your listing.",
      "Open Availability → Connect calendars (Sync calendars).",
      "Choose “Connect another website” / “Import calendar”.",
      "Paste the Ikigonyi link below and name it “Ikigonyi website”.",
    ],
    exportSteps: [
      "In the same Sync calendars screen, choose “Export calendar”.",
      "Copy the link Airbnb shows (it ends in .ics).",
      "Paste it in the box below.",
    ],
    hint: "https://www.airbnb.com/calendar/ical/....ics?s=...",
  },
  booking_com: {
    importSteps: [
      "Log in to the Booking.com Extranet.",
      "Go to Rates & Availability → Sync calendars.",
      "Click “Add calendar connection” and choose to import a calendar.",
      "Paste the Ikigonyi link below and name it “Ikigonyi website”.",
    ],
    exportSteps: [
      "In Sync calendars, choose to export your Booking.com calendar.",
      "Copy the link Booking.com shows (it ends in .ics).",
      "Paste it in the box below.",
    ],
    hint: "https://admin.booking.com/hotel/hoteladmin/ical.html?t=...",
  },
};

export function ChannelWizard({ channel, onClose, onDone }: { channel: Ch | null; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const sync = useServerFn(syncChannel);
  const guide = channel ? GUIDES[channel.code] : undefined;
  const feed = channel ? `${ASSET_ORIGIN}/api/public/ical/${channel.id}.ics` : "";

  const run = useMutation({
    mutationFn: () => sync({ data: { channelId: channel!.id, url: url.trim() } }),
    onSuccess: (r) => {
      toast.success(`${channel!.name} connected — ${r.imported} reservation(s) imported`);
      setStep(3);
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const close = () => {
    setStep(0);
    setUrl("");
    onClose();
  };

  return (
    <Dialog open={!!channel} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect {channel?.name}</DialogTitle>
        </DialogHeader>
        {channel && guide && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {["Send", "Receive", "Test", "Done"].map((s, i) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>

            {step === 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Step 1 — Send your website bookings to {channel.name} so the same dates can’t be booked twice.
                </p>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {guide.importSteps.map((s) => <li key={s}>{s}</li>)}
                </ol>
                <div className="flex gap-2">
                  <Input readOnly value={feed} className="text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(feed);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <Button className="w-full" onClick={() => setStep(1)}>I’ve added it — next</Button>
              </>
            )}

            {step === 1 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Step 2 — Bring {channel.name} bookings into your dashboard calendar.
                </p>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {guide.exportSteps.map((s) => <li key={s}>{s}</li>)}
                </ol>
                <Input
                  placeholder={guide.hint}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button className="flex-1" disabled={!/^https:\/\//.test(url.trim())} onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Step 3 — We’ll read the {channel.name} calendar now and block any booked dates.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1" disabled={run.isPending} onClick={() => run.mutate()}>
                    {run.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Test & connect
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-sm">
                  {channel.name} is connected. Use “Sync now” on the Channels page any time; {channel.name} also
                  re-reads your website calendar automatically every few hours.
                </p>
                <Button className="w-full" onClick={close}>Finish</Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
