import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-lake.jpg";
import livingImage from "@/assets/living.jpg";
import bedroomImage from "@/assets/bedroom.jpg";
import terraceImage from "@/assets/terrace.jpg";

const DESCRIPTION =
  "Photography of Ikigonyi Round House — the house, bedrooms, living spaces, the lake, outdoor areas and experiences on Lake Muhazi, Rwanda.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ikigonyi Round House, Lake Muhazi" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Gallery — Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: GalleryPage,
});

const CATEGORIES = [
  "All",
  "House",
  "Bedrooms",
  "Living Spaces",
  "Lake",
  "Outdoor",
  "Experiences",
] as const;

const PLACEHOLDERS = [
  { id: "p1", category: "House", image_url: heroImage, alt_text: "The round house at sunrise" },
  { id: "p2", category: "Living Spaces", image_url: livingImage, alt_text: "Living space" },
  { id: "p3", category: "Bedrooms", image_url: bedroomImage, alt_text: "Bedroom with lake view" },
  { id: "p4", category: "Outdoor", image_url: terraceImage, alt_text: "Terrace at dusk" },
  { id: "p5", category: "Lake", image_url: heroImage, alt_text: "Lake Muhazi shoreline" },
  { id: "p6", category: "Experiences", image_url: terraceImage, alt_text: "Long table dinner" },
  { id: "p7", category: "House", image_url: livingImage, alt_text: "Interior detail" },
  { id: "p8", category: "Bedrooms", image_url: bedroomImage, alt_text: "Morning light" },
];

function GalleryPage() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const images = data && data.length > 0 ? data : PLACEHOLDERS;
  const filtered = active === "All" ? images : images.filter((i) => i.category === active);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Gallery"
        title="A look around Ikigonyi."
        intro="Images shown are placeholders until the property photography is published from the manager dashboard."
      />

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors",
                active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightbox(img.image_url)}
              className="block w-full overflow-hidden rounded-2xl"
              aria-label={`Open image: ${img.alt_text ?? "Ikigonyi Round House"}`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text ?? "Ikigonyi Round House"}
                loading="lazy"
                width={1280}
                height={960}
                className={cn(
                  "w-full object-cover transition-transform duration-700 hover:scale-[1.03]",
                  i % 3 === 0 ? "aspect-3/4" : i % 3 === 1 ? "aspect-square" : "aspect-4/3",
                )}
              />
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">No images in this category yet.</p>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-5 top-5 rounded-full p-2 text-background"
            onClick={() => setLightbox(null)}
          >
            <X className="size-6" />
          </button>
          <img
            src={lightbox}
            alt="Ikigonyi Round House"
            className="max-h-[88svh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </SiteLayout>
  );
}
