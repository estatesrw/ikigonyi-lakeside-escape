import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookingSearch } from "@/components/site/BookingSearch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/lib/property";
import { photos } from "@/lib/photos";

const DESCRIPTION =
  "Ikigonyi Round House is an African-style lakefront villa on Lake Muhazi, Rwamagana, Rwanda. Six bedrooms, up to twelve guests, a panoramic thatched terrace and a private chef on request.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ikigonyi Round House — Private Lakeside Retreat on Lake Muhazi, Rwanda" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Ikigonyi Round House — Lake Muhazi, Rwanda" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: "Ikigonyi Round House",
          description: DESCRIPTION,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Rwamagana",
            addressRegion: "Eastern Province",
            addressCountry: "RW",
          },
          numberOfRooms: 6,
          petsAllowed: true,
        }),
      },
    ],
  }),
  component: HomePage,
});

const AMENITIES = [
  "6 Bedrooms · 10 Beds",
  "6 Bathrooms",
  "Up to 12 Guests",
  "Waterfront Setting",
  "Fully Equipped Kitchen",
  "Panoramic Terrace",
  "Private Chef on Request",
  "Wifi & Workspace",
  "Free Parking",
  "Pets Allowed",
];

const WHY = [
  { title: "Private", body: "The whole house is yours — no shared spaces, no reception desk." },
  { title: "Peaceful", body: "Quiet mornings, open water and the sound of the lake." },
  { title: "Lakeside", body: "Waterfront, with the lake a short walk from the terrace." },
  { title: "Group Friendly", body: "Six bedrooms across two houses, sleeping up to twelve." },
  { title: "Designed for Experiences", body: "Built for gatherings, meals and slow weekends." },
  { title: "Close to Kigali", body: "An easy change of scenery from the city." },
];

function HomePage() {
  const { data: content } = useSiteContent();

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

  const { data: reviews } = useQuery({
    queryKey: ["reviews", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const experienceImages = [photos.terrace, photos.dining, photos.living, photos.livingStairs, photos.lake];

  return (
    <SiteLayout overlayHeader>
      {/* HERO */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <img
          src={photos.exterior}
          alt="The thatched stone round house above Lake Muhazi"
          width={1920}
          height={1088}
          className="slow-zoom absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/40" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-8 md:pb-24">
          <p className="fade-up inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary-foreground/85">
            <MapPin className="size-3.5" /> Lake Muhazi, Rwanda
          </p>
          <h1 className="display fade-up mt-6 max-w-4xl text-5xl leading-[1.02] text-primary-foreground md:text-8xl">
            {content?.["hero_headline"] ?? "African-style villa on Lake Muhazi."}
          </h1>
          <p className="fade-up mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            {content?.["hero_subheadline"] ??
              "A private lakeside retreat designed for slow mornings, shared moments and unforgettable weekends."}
          </p>
          <div className="fade-up mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <a href="#availability">Check availability</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-primary-foreground/40 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/stay">Explore Ikigonyi</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* BOOKING SEARCH */}
      <section id="availability" className="relative z-10 mx-auto -mt-10 max-w-5xl px-5 md:px-8">
        <BookingSearch />
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
        <div>
          <p className="eyebrow">The retreat</p>
          <h2 className="display mt-4 text-4xl leading-tight md:text-5xl">
            {content?.["intro_headline"] ?? "A private retreat by the lake."}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Two lakefront houses on the shores of Lake Muhazi, built in traditional African style
            with a spectacular handcrafted thatched roof.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Local stone, handcrafted wood and thatch, a panoramic terrace, bright living rooms and an
            open kitchen — perfect for families, friends, retreats and wellness stays.
          </p>
          <Button asChild variant="link" className="mt-6 px-0 text-base">
            <Link to="/about">Read our story →</Link>
          </Button>
        </div>
        <img
          src={photos.living}
          alt="Bright curved living room with lake views"
          loading="lazy"
          width={1280}
          height={960}
          className="aspect-4/3 w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]"
        />
      </section>

      {/* THE HOUSE */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">The house</p>
              <h2 className="display mt-4 max-w-xl text-4xl leading-tight md:text-5xl">
                Six bedrooms, twelve guests, one shoreline.
              </h2>
            </div>
            <Button asChild className="rounded-full px-6">
              <Link to="/stay">Explore the house</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <img
              src={photos.bedroomKing}
              alt="King bedroom with carved wooden headboard"
              loading="lazy"
              width={1280}
              height={960}
              className="h-full max-h-[520px] w-full rounded-3xl object-cover"
            />
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border">
              {AMENITIES.map((a) => (
                <li
                  key={a}
                  className="flex items-center bg-card px-5 py-8 text-sm leading-snug text-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <p className="eyebrow">Experiences</p>
        <h2 className="display mt-4 text-4xl leading-tight md:text-5xl">More than a stay.</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(experiences ?? []).map((exp, i) => (
            <article
              key={exp.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-[var(--shadow-soft)]"
            >
              <div className="overflow-hidden">
                <img
                  src={exp.image_url ?? experienceImages[i % experienceImages.length]}
                  alt={exp.title}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="display text-2xl">{exp.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {exp.description}
                </p>
                <Button asChild variant="link" className="mt-4 px-0">
                  <Link to="/experiences">Enquire →</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* GALLERY TEASER */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Gallery</p>
              <h2 className="display mt-4 text-4xl leading-tight md:text-5xl">
                A look around Ikigonyi.
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/gallery">View gallery</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[photos.exteriorNight, photos.livingLounge, photos.bedroomCanopy, photos.thatch].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Ikigonyi Round House"
                loading="lazy"
                width={1280}
                height={960}
                className="aspect-3/4 w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      {/* WHY IKIGONYI */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <p className="eyebrow">Why Ikigonyi</p>
        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="border-t border-border pt-6">
              <h3 className="display text-2xl">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAKE MUHAZI */}
      <section className="relative overflow-hidden">
        <img
          src={photos.terrace}
          alt="Evening table set beside Lake Muhazi"
          loading="lazy"
          width={1280}
          height={960}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/65" />
        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center md:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-primary-foreground/80">
            Lake Muhazi
          </p>
          <h2 className="display mt-5 text-4xl leading-tight text-primary-foreground md:text-6xl">
            {content?.["destination_headline"] ?? "Your escape from the city."}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/85">
            {content?.["destination_body"] ??
              "Lake Muhazi offers a calm, natural alternative to the city — a place for weekend escapes, gatherings and slower, nature-focused stays."}
          </p>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <p className="eyebrow">Guests</p>
        <h2 className="display mt-4 text-4xl leading-tight md:text-5xl">What guests say.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {(reviews ?? []).map((r) => (
            <figure key={r.id} className="rounded-3xl border border-border bg-card p-7">
              <div className="flex gap-1" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-foreground">
                “{r.body}”
              </blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">
                {r.author_name}
                {r.author_location ? ` · ${r.author_location}` : ""}
              </figcaption>
            </figure>
          ))}
          {reviews?.length === 0 && (
            <p className="text-sm text-muted-foreground">No reviews published yet.</p>
          )}
        </div>
      </section>

      {/* LOCATION */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
          <div>
            <p className="eyebrow">Location</p>
            <h2 className="display mt-4 text-4xl leading-tight md:text-5xl">Lake Muhazi, Rwanda</h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Ikigonyi Round House sits directly on the shoreline of Lake Muhazi. Full arrival
              directions are shared with every confirmed booking.
            </p>
            <Button asChild className="mt-7 rounded-full px-6">
              <Link to="/location">Get directions</Link>
            </Button>
          </div>
          <div className="flex aspect-4/3 items-center justify-center rounded-3xl border border-dashed border-border bg-card text-center">
            <div className="px-8">
              <MapPin className="mx-auto size-7 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Interactive map placeholder — connect Google Maps from the manager dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <img
          src={photos.exterior}
          alt="Lake Muhazi at golden hour"
          loading="lazy"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative mx-auto max-w-3xl px-5 py-32 text-center md:px-8">
          <h2 className="display text-4xl leading-tight text-primary-foreground md:text-6xl">
            {content?.["final_cta_headline"] ?? "Your weekend at the lake starts here."}
          </h2>
          <Button asChild size="lg" className="mt-9 rounded-full px-8">
            <Link to="/book">Book your stay</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
