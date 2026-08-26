import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { BookingSearch } from "@/components/site/BookingSearch";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/property";
import { photos } from "@/lib/photos";

const DESCRIPTION =
  "Looking for stays near Lake Muhazi? Ikigonyi Round House is a private six-bedroom lakefront villa in Rwamagana, Rwanda — boat rides, chef on request, sleeps 12, one hour from Kigali.";

const FAQS = [
  {
    q: "What is the best place to stay near Lake Muhazi?",
    a: "Ikigonyi Round House is a private lakefront villa directly on the shoreline of Lake Muhazi in Rwamagana. Unlike a hotel, the whole property is yours: six bedrooms, six bathrooms, a panoramic thatched terrace and space for up to twelve guests.",
  },
  {
    q: "Are there hotels on Lake Muhazi or is a villa better?",
    a: "Lake Muhazi has a handful of small lodges, but for families and groups a private villa usually works out better: exclusive use of the house, your own kitchen and terrace, flexible meals with a private chef on request, and per-night pricing that suits groups of up to twelve.",
  },
  {
    q: "What activities are there near Lake Muhazi accommodation?",
    a: "From the house you can arrange boat rides, swimming and fishing on the lake, lakeside BBQs and private dinners, sunrise shoreline walks, birdwatching, and day trips to Akagera National Park (about 1 hour 30 minutes away).",
  },
  {
    q: "How do I get to Lake Muhazi from Kigali?",
    a: "Lake Muhazi is roughly one hour by road from Kigali via Rwamagana, and about 1 hour 15 minutes from Kigali International Airport. Airport pickup and private transfers can be arranged on request, and full arrival directions are shared with every confirmed booking.",
  },
  {
    q: "Can I book a stay near Lake Muhazi for a group or retreat?",
    a: "Yes — the property sleeps up to twelve guests across two lakefront houses and is designed for gatherings, retreats and wellness stays. Check availability online or message the team on WhatsApp at 0791 915 459.",
  },
];

const HIGHLIGHTS = [
  "Directly on the Lake Muhazi shoreline",
  "Six bedrooms · ten beds · six bathrooms",
  "Sleeps up to twelve guests",
  "Boat rides, fishing and lakeside dining",
  "Private chef and airport transfers on request",
  "Day trips to Akagera National Park",
];

export const Route = createFileRoute("/stays-near-lake-muhazi")({
  head: () => ({
    meta: [
      { title: "Stays near Lake Muhazi | Lakefront Villa in Rwamagana, Rwanda" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Stays near Lake Muhazi — Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/stays-near-lake-muhazi` },
      { property: "og:image", content: photos.lake },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: photos.lake },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/stays-near-lake-muhazi` }],
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
  component: StaysNearLakeMuhaziPage,
});

function StaysNearLakeMuhaziPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Lake Muhazi accommodation"
        title="Stays near Lake Muhazi."
        intro="If you're searching for where to stay near Lake Muhazi, Ikigonyi Round House is a private lakefront villa on the shoreline in Rwamagana — your own house, terrace and stretch of lake, about an hour from Kigali."
      />

      <section className="mx-auto max-w-5xl px-5 md:px-8">
        <BookingSearch />
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
        <img
          src={photos.lake}
          alt="View over Lake Muhazi from Ikigonyi Round House, Rwamagana"
          loading="lazy"
          width={1280}
          height={960}
          className="aspect-4/3 w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]"
        />
        <div>
          <h2 className="display text-3xl leading-tight md:text-4xl">
            A private villa, not a hotel room.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Most Lake Muhazi accommodation is shared lodges and guesthouses. Ikigonyi is different:
            two lakefront houses built in traditional African style with a handcrafted thatched
            roof, booked exclusively for you. Mornings on the terrace, afternoons on the water,
            evenings around a lakeside table.
          </p>
          <ul className="mt-7 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {h}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/book">Check availability & book</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/stay">Explore the house</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-4xl px-5 py-24 md:px-8">
          <p className="eyebrow">Good to know</p>
          <h2 className="display mt-4 text-3xl leading-tight md:text-4xl">
            Lake Muhazi stay FAQs.
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
            Planning from the capital? See our{" "}
            <Link to="/weekend-escapes-near-kigali" className="text-primary underline underline-offset-4">
              weekend escapes near Kigali
            </Link>{" "}
            guide, browse the <Link to="/gallery" className="text-primary underline underline-offset-4">gallery</Link>,
            or check <Link to="/location" className="text-primary underline underline-offset-4">directions to Lake Muhazi</Link>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
