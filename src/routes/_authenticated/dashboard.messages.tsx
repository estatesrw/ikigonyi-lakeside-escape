import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { usePropertyId } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fld, Picker } from "./dashboard.bookings";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/messages")({
  component: MessagesPage,
});

const CHANNELS = ["whatsapp", "email", "instagram", "phone", "other"] as const;

function MessagesPage() {
  const { data: property } = usePropertyId();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    guest_name: "",
    channel: "whatsapp",
    direction: "outbound",
    body: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["messages", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("property_id", property!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const log = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        property_id: property!.id,
        guest_name: form.guest_name,
        channel: form.channel,
        direction: form.direction,
        body: form.body,
        status: "logged",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message logged");
      setForm({ ...form, guest_name: "", body: "" });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageTitle
        title="Communications"
        description="A shared log of every guest conversation across channels."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-card">
          {(data ?? []).length === 0 ? (
            <div className="p-6">
              <EmptyState title="No messages logged" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(data ?? []).map((m) => (
                <li key={m.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{m.guest_name ?? "Unknown guest"}</span>
                    <Badge variant="outline" className="font-normal">
                      {m.channel}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {m.direction}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          className="h-fit space-y-4 rounded-xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            log.mutate();
          }}
        >
          <h2 className="text-sm font-semibold">Log a conversation</h2>
          <Fld label="Guest">
            <Input
              required
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
            />
          </Fld>
          <Fld label="Channel">
            <Picker
              value={form.channel}
              options={CHANNELS}
              onChange={(v) => setForm({ ...form, channel: v })}
            />
          </Fld>
          <Fld label="Direction">
            <Picker
              value={form.direction}
              options={["inbound", "outbound"]}
              onChange={(v) => setForm({ ...form, direction: v })}
            />
          </Fld>
          <Fld label="Message">
            <Textarea
              rows={4}
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Fld>
          <Button type="submit" className="w-full" disabled={log.isPending}>
            Save to log
          </Button>
        </form>
      </div>
    </div>
  );
}
