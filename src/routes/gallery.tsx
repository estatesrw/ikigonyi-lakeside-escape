import { SITE_URL } from "@/lib/property";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { galleryPhotos, publicMediaUrl } from "@/lib/photos";

const DESCRIPTION =
  "Photography of Ikigonyi Round House — the house, bedrooms, living spaces, the lake, outdoor areas and experiences on Lake Muhazi, Rwanda.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ikigonyi Round House, Lake Muhazi" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Gallery — Ikigonyi Round House" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/gallery` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/gallery` }],
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

const PLACEHOLDERS = galleryPhotos;

type MediaItem = {
  id: string;
  category: string;
  image_url: string;
  alt_text?: string | null;
  media_type?: string | null;
  video_url?: string | null;
  caption?: string | null;
};

function GalleryPage() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

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

  const images: MediaItem[] = data && data.length > 0 ? (data as MediaItem[]) : PLACEHOLDERS;
  const filtered = active === "All" ? images : images.filter((i) => i.category === active);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Gallery"
        title="A look around Ikigonyi."
        intro="Photography and film from the round house, the annexe and the lake shore."
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
          {filtered.map((item, i) =>
            item.media_type === "video" ? (
              <figure key={item.id} className="overflow-hidden rounded-2xl">
                <video
                  src={publicMediaUrl(item.video_url) || undefined}
                  poster={publicMediaUrl(item.image_url) || undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full rounded-2xl bg-muted"
                />
                {item.caption && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightbox(item)}
                className="block w-full overflow-hidden rounded-2xl"
                aria-label={`Open image: ${item.alt_text ?? "Ikigonyi Round House"}`}
              >
                <img
                  src={publicMediaUrl(item.image_url)}
                  alt={item.alt_text ?? "Ikigonyi Round House"}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className={cn(
                    "w-full object-cover transition-transform duration-700 hover:scale-[1.03]",
                    i % 3 === 0 ? "aspect-3/4" : i % 3 === 1 ? "aspect-square" : "aspect-4/3",
                  )}
                />
              </button>
            ),
          )}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">No media in this category yet.</p>
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
            src={publicMediaUrl(lightbox.image_url)}
            alt={lightbox.alt_text ?? "Ikigonyi Round House"}
            className="max-h-[88svh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </SiteLayout>
  );
}

