import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { SITE_URL, useSiteContent } from "@/lib/property";
import { photos } from "@/lib/photos";

const DESCRIPTION =
  "The story behind Ikigonyi Round House — a private lakeside retreat on Lake Muhazi, Rwanda, managed by EstatesRW.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ikigonyi Round House, Lake Muhazi" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "About Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: content } = useSiteContent();

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title={content?.["intro_headline"] ?? "A private retreat by the lake."}
        intro="Ikigonyi Round House is a whole-house retreat on the shores of Lake Muhazi, built for people who want space, quiet and the freedom of having the place to themselves."
      />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 md:grid-cols-2 md:px-8">
        <img
          src={photos.living}
          alt="Bright curved living room at Ikigonyi Round House"
          loading="lazy"
          width={1280}
          height={960}
          className="aspect-4/3 w-full rounded-3xl object-cover"
        />
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            The house takes its name and its shape from the round form at its centre — a social
            space that opens outward toward the water on every side.
          </p>
          <p>
            Six bedrooms and ten beds sleep up to twelve guests, which makes Ikigonyi as suited to two people
            over a quiet weekend as it is to a family, a group of friends or a small team stepping
            away from the office.
          </p>
          <p>
            Ikigonyi Round House is operated and managed by EstatesRW, who look after bookings,
            guest communication and the day-to-day running of the property.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src={photos.lake}
          alt="Lake Muhazi shoreline"
          loading="lazy"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center md:px-8">
          <h2 className="display text-4xl leading-tight text-primary-foreground md:text-5xl">
            Come and see it for yourself.
          </h2>
          <Button asChild size="lg" className="mt-8 rounded-full px-8">
            <Link to="/book">Book your stay</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
