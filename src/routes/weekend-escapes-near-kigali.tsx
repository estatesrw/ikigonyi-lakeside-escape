import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { BookingSearch } from "@/components/site/BookingSearch";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/property";
import { photos } from "@/lib/photos";

const DESCRIPTION =
  "The easiest weekend escape near Kigali: Ikigonyi Round House, a private lakefront villa on Lake Muhazi one hour from the city. Six bedrooms, chef on request, boat rides — book direct.";

const FAQS = [
  {
    q: "Where can I go for a weekend getaway near Kigali?",
    a: "Lake Muhazi is one of the closest and calmest weekend escapes from Kigali — about one hour by road via Rwamagana. Ikigonyi Round House is a private lakefront villa on the shoreline, sleeping up to twelve guests.",
  },
  {
    q: "How far is Ikigonyi Round House from Kigali?",
    a: "Roughly one hour by road from central Kigali and about 1 hour 15 minutes from Kigali International Airport, which makes a Friday-to-Sunday escape easy without losing half a day to driving.",
  },
  {
    q: "Is the villa good for a group weekend from Kigali?",
    a: "Yes — the property sleeps twelve across six bedrooms in the lakefront house and its modern annexe, with a full kitchen, panoramic terrace and space for gatherings. A private chef, boat rides and lakeside BBQs can be arranged on request.",
  },
  {
    q: "What does a weekend at Lake Muhazi look like?",
    a: "Arrive Friday evening for dinner on the terrace, spend Saturday on the water — boat rides, swimming, fishing — then a slow Sunday morning by the lake before the one-hour drive back to Kigali.",
  },
  {
    q: "Can I add a safari to a Kigali weekend escape?",
    a: "Yes. Akagera National Park is about 1 hour 30 minutes east of the house, so guests often combine a lakeside weekend with a game-drive day trip before heading back to Kigali.",
  },
];

const PLAN = [
  { step: "Friday", body: "Leave Kigali after work, arrive for sunset and dinner on the terrace." },
  { step: "Saturday", body: "Boat rides, swimming and fishing on the lake — or a day trip to Akagera." },
  { step: "Sunday", body: "Slow lakeside breakfast, shoreline walk, back in Kigali by afternoon." },
];

export const Route = createFileRoute("/weekend-escapes-near-kigali")({
  head: () => ({
    meta: [
      { title: "Weekend Escapes near Kigali | Lake Muhazi Villa Getaway" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Weekend escapes near Kigali — Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/weekend-escapes-near-kigali` },
      { property: "og:image", content: photos.terrace },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: photos.terrace },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/weekend-escapes-near-kigali` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: WeekendEscapesPage,
});

function WeekendEscapesPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Weekend getaways from Kigali"
        title="One hour from Kigali, a world away."
        intro="The easiest weekend escape near Kigali: a private lakefront villa on Lake Muhazi with the whole house to yourselves — close enough for a spontaneous Friday departure, far enough to feel like a real break."
      />

      <section className="mx-auto max-w-5xl px-5 md:px-8">
        <BookingSearch />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="display text-3xl leading-tight md:text-4xl">
              Your weekend, hour by hour.
            </h2>
            <div className="mt-8 space-y-6">
              {PLAN.map((p) => (
                <div key={p.step} className="flex gap-5 border-t border-border pt-5">
                  <p className="eyebrow w-20 shrink-0 pt-1">{p.step}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link to="/book">Book your weekend</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/experiences">Things to do</Link>
              </Button>
            </div>
          </div>
          <img
            src={photos.terrace}
            alt="Terrace dinner beside Lake Muhazi, one hour from Kigali"
            loading="lazy"
            width={1280}
            height={960}
            className="aspect-4/3 w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]"
          />
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <ul className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3">
            {[
              "≈ 1 hour from Kigali",
              "Sleeps 12 · 6 bedrooms",
              "Private chef on request",
            ].map((h) => (
              <li
                key={h}
                className="flex items-center justify-center gap-2 bg-card px-5 py-8 text-sm"
              >
                <Check className="size-4 text-primary" /> {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-24 md:px-8">
        <p className="eyebrow">Good to know</p>
        <h2 className="display mt-4 text-3xl leading-tight md:text-4xl">
          Kigali weekend escape FAQs.
        </h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="cursor-pointer list-none text-base font-medium marker:hidden">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Compare with other{" "}
          <Link to="/stays-near-lake-muhazi" className="text-primary underline underline-offset-4">
            stays near Lake Muhazi
          </Link>
          , take a <Link to="/gallery" className="text-primary underline underline-offset-4">look around the house</Link>,
          or read <Link to="/about" className="text-primary underline underline-offset-4">our story</Link>.
        </p>
      </section>
    </SiteLayout>
  );
}
