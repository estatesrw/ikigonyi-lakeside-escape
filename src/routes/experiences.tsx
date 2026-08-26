import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { photos, publicMediaUrl } from "@/lib/photos";
import { SITE_URL, useProperty } from "@/lib/property";

const DESCRIPTION =
  "Weekend getaways, lakeside BBQs, private gatherings, corporate retreats and lake experiences at Ikigonyi Round House on Lake Muhazi, Rwanda.";

export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Experiences — Ikigonyi Round House, Lake Muhazi" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Experiences at Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/experiences` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/experiences` }],
  }),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { data: property } = useProperty();
  const [interest, setInterest] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const { data: experiences } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Unavailable");
      const { data, error } = await supabase.rpc("create_inquiry", {
        _property_id: property.id,
        _name: form.name,
        _email: form.email,
        _phone: form.phone,
        ...(interest ? { _interest: interest } : {}),
        ...(form.message ? { _message: form.message } : {}),
      });
      if (error) throw error;
      const result = data as unknown as { error?: string };
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("Thank you — we'll be in touch shortly.");
      setInterest(null);
      setForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: (e: Error) => toast.error(e.message || "Something went wrong."),
  });

  const images = [photos.terrace, photos.dining, photos.living, photos.livingStairs, photos.lake];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Experiences"
        title="More than a stay."
        intro="Ikigonyi is built for gatherings — the kind of weekend where the day drifts from breakfast to the water to a long table at dusk."
      />

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {(experiences ?? []).map((exp, i) => (
            <article
              key={exp.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="overflow-hidden">
                <img
                  src={publicMediaUrl(exp.image_url) || images[i % images.length]}
                  alt={exp.title}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="aspect-16/10 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-7">
                <h2 className="display text-3xl">{exp.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {exp.description}
                </p>
                <Button
                  className="mt-6 rounded-full px-6"
                  variant="outline"
                  onClick={() => setInterest(exp.title)}
                >
                  Enquire about {exp.title}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog open={interest !== null} onOpenChange={(o) => !o && setInterest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="display text-2xl">Enquire — {interest}</DialogTitle>
            <DialogDescription>
              Tell us a little about what you have in mind and we'll come back to you.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="e-name">Name</Label>
              <Input
                id="e-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="e-email">Email</Label>
                <Input
                  id="e-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-phone">Phone</Label>
                <Input
                  id="e-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-msg">Message</Label>
              <Textarea
                id="e-msg"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={submit.isPending}>
              {submit.isPending ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
