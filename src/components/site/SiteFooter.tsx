import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT, useProperty, whatsappLink } from "@/lib/property";

export function SiteFooter() {
  const { data: property } = useProperty();

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <h2 className="display text-2xl">Ikigonyi Round House</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {property?.location ?? "Lake Muhazi, Rwanda"}
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A private lakeside retreat designed for slow mornings, shared moments and unforgettable
            weekends.
          </p>
          <Button asChild className="mt-6 rounded-full px-6">
            <Link to="/book">Book your stay</Link>
          </Button>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/stay", label: "Stay" },
              { to: "/experiences", label: "Experiences" },
              { to: "/gallery", label: "Gallery" },
              { to: "/about", label: "About" },
              { to: "/location", label: "Location" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                href={whatsappLink(property?.whatsapp_number)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" /> WhatsApp {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                href={`tel:${CONTACT.phone}`}
              >
                <Phone className="size-4" /> {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                href={`mailto:${property?.contact_email ?? CONTACT.email}`}
              >
                <Mail className="size-4" /> {property?.contact_email ?? CONTACT.email}
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                href={property?.instagram_url ?? CONTACT.instagram}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="size-4" /> @ikigonyiroundhouse
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Ikigonyi Round House. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Managed by EstatesRW</span>
            <Link to="/auth" className="hover:text-foreground">
              Manager login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
