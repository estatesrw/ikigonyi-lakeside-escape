import { SITE_URL } from "@/lib/property";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { photos, publicMediaUrl } from "@/lib/photos";
import { BookingSearch } from "@/components/site/BookingSearch";

const DESCRIPTION =
  "Six bedrooms sleeping up to twelve guests, living and social spaces, a full kitchen and private lakeside outdoor areas at Ikigonyi Round House on Lake Muhazi.";

export const Route = createFileRoute("/stay")({
  head: () => ({
    meta: [
      { title: "The House — Ikigonyi Round House, Lake Muhazi" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "The House — Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/stay` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/stay` }],
  }),
  component: StayPage,
});

function StayPage() {
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: amenities } = useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("amenities").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const images = [photos.bedroomKing, photos.bedroomCanopy, photos.bedroomTwin, photos.bedroomLamplight, photos.bedroomDarkWood, photos.bedroomAnnexe];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="The house"
        title="A thatched round house, built around the view."
        intro="Ikigonyi is a whole-house retreat: six bedrooms across two lakefront houses, generous social spaces and an outdoor life that follows the lake from sunrise to evening."
      />

      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <img
          src={photos.terrace}
          alt="Panoramic covered terrace overlooking Lake Muhazi"
          loading="lazy"
          width={1280}
          height={960}
          className="aspect-16/9 w-full rounded-3xl object-cover"
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <p className="eyebrow">Bedrooms</p>
        <h2 className="display mt-4 text-3xl md:text-4xl">Six rooms, ten beds, twelve guests.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(rooms ?? []).map((room, i) => (
            <article key={room.id} className="overflow-hidden rounded-3xl border border-border bg-card">
              <img
                src={publicMediaUrl(room.image_url) || images[i % images.length]}
                alt={room.name}
                loading="lazy"
                width={1280}
                height={960}
                className="aspect-16/10 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="display text-2xl">{room.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Sleeps {room.sleeps} · {room.bed_configuration}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <p className="eyebrow">Amenities</p>
          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {(amenities ?? []).map((a) => (
              <li key={a.id} className="border-t border-border pt-4 text-sm">
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 md:px-8">
        <h2 className="display text-3xl md:text-4xl">Check your dates.</h2>
        <div className="mt-8">
          <BookingSearch />
        </div>
        <Button asChild variant="link" className="mt-6 px-0">
          <Link to="/experiences">Or explore what you can do here →</Link>
        </Button>
      </section>
    </SiteLayout>
  );
}
