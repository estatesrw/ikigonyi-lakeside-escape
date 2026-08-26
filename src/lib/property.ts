import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PROPERTY_SLUG = "ikigonyi-round-house";

export const CONTACT = {
  phone: "+250791915459",
  phoneDisplay: "0791 915 459",
  email: "IkigonyiRoundHouse@hotmail.com",
  instagram: "https://www.instagram.com/ikigonyiroundhouse/",
} as const;

export const SITE_URL = "https://ikigonyi.com";

export type PropertyRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  location: string | null;
  bedrooms: number;
  max_guests: number;
  currency: string;
  whatsapp_number: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function useProperty() {
  return useQuery({
    queryKey: ["property", PROPERTY_SLUG],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PropertyRow | null> => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", PROPERTY_SLUG)
        .maybeSingle();
      if (error) throw error;
      return data as PropertyRow | null;
    },
  });
}

export function useSiteContent() {
  return useQuery({
    queryKey: ["site_content"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("site_content").select("key,value");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
    },
  });
}

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function whatsappLink(number?: string | null, message?: string) {
  const digits = (number ?? CONTACT.phone).replace(/\D/g, "");
  const text = encodeURIComponent(message ?? "Hello, I'd like to ask about Ikigonyi Round House.");
  return `https://wa.me/${digits}?text=${text}`;
}

/** Public Google Maps link for the property (directions / business profile). */
export function mapsShareUrl(property?: Pick<PropertyRow, "google_maps_url" | "latitude" | "longitude"> | null) {
  if (property?.google_maps_url) return property.google_maps_url;
  if (property?.latitude && property?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
  }
  return "https://www.google.com/maps/search/?api=1&query=Ikigonyi+Round+House+Rwamagana";
}

/** Embeddable Google Maps iframe URL. Share links can't be iframed, so embed by place query/coords. */
export function mapsEmbedUrl(
  property?: Pick<PropertyRow, "name" | "location" | "latitude" | "longitude"> | null,
) {
  if (property?.latitude && property?.longitude) {
    return `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`;
  }
  const q = encodeURIComponent(
    [property?.name ?? "Ikigonyi Round House", property?.location ?? "Lake Muhazi, Rwamagana, Rwanda"].join(", "),
  );
  return `https://www.google.com/maps?q=${q}&z=13&output=embed`;
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn + "T00:00:00");
  const b = new Date(checkOut + "T00:00:00");
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
