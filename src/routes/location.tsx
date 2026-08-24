import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Mail, MessageCircle, Phone } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { CONTACT, SITE_URL, useProperty, whatsappLink } from "@/lib/property";

const DESCRIPTION =
  "How to reach Ikigonyi Round House on Lake Muhazi, Rwamagana — about an hour from Kigali. Directions, drive times and arrival details for your lakeside stay in Rwanda.";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Location & Directions — Lake Muhazi Stay near Kigali, Rwanda" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Location — Lake Muhazi, Rwanda" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/location` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/location` }],
  }),
  component: LocationPage,
});

function LocationPage() {
  const { data: property } = useProperty();
  const mapsUrl =
    property?.google_maps_url ??
    (property?.latitude && property?.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
      : "https://www.google.com/maps/search/?api=1&query=Lake+Muhazi+Rwanda");

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Location"
        title="Lake Muhazi, Rwanda."
        intro="Ikigonyi Round House sits directly on the shoreline of Lake Muhazi. Full arrival directions are shared with every confirmed booking."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 md:grid-cols-[1.4fr_1fr] md:px-8">
        <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-border bg-card">
          <div className="max-w-sm px-8 text-center">
            <MapPin className="mx-auto size-8 text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Interactive map placeholder. A manager can add the exact Google Maps link in
              Dashboard → Settings, and it will appear here.
            </p>
            <Button asChild className="mt-6 rounded-full px-6">
              <a href={mapsUrl} target="_blank" rel="noreferrer">
                Get directions
              </a>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="display text-2xl">Getting in touch</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The quickest way to reach us is WhatsApp. We're happy to help with dates, group sizes
            and gatherings.
          </p>
          <div className="mt-6 space-y-3">
            <Button asChild variant="outline" className="w-full justify-start rounded-full">
              <a href={whatsappLink(property?.whatsapp_number)} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 size-4" /> Chat with us
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-full">
              <a href={`mailto:${property?.contact_email ?? "hello@estatesrw.com"}`}>
                <Mail className="mr-2 size-4" /> {property?.contact_email ?? "hello@estatesrw.com"}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
