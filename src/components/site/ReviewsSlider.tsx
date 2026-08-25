import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export type SiteReview = {
  id: string;
  author_name: string;
  author_location: string | null;
  rating: number;
  body: string;
  stay_date?: string | null;
};

export function ReviewsSlider({ reviews }: { reviews: SiteReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews published yet.</p>;
  }

  return (
    <Carousel
      opts={{ align: "start", loop: reviews.length > 1 }}
      className="mt-12"
    >
      <CarouselContent className="-ml-6">
        {reviews.map((r) => (
          <CarouselItem key={r.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
            <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-7">
              <div className="flex gap-1" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                “{r.body}”
              </blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">
                {r.author_name}
                {r.author_location ? ` · ${r.author_location}` : ""}
                {r.stay_date ? ` · ${r.stay_date}` : ""}
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      {reviews.length > 1 && (
        <div className="mt-8 flex justify-end gap-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      )}
    </Carousel>
  );
}
