import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/stay", label: "Stay" },
  { to: "/experiences", label: "Experiences" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/location", label: "Location" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overlay || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-border/60 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="group flex flex-col leading-none" aria-label="Ikigonyi Round House">
          <span
            className={cn(
              "display text-lg tracking-tight transition-colors md:text-xl",
              solid ? "text-foreground" : "text-primary-foreground",
            )}
          >
            Ikigonyi Round House
          </span>
          <span
            className={cn(
              "mt-1 text-[0.62rem] uppercase tracking-[0.28em] transition-colors",
              solid ? "text-muted-foreground" : "text-primary-foreground/75",
            )}
          >
            Lake Muhazi
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm transition-colors",
                solid
                  ? "text-foreground/75 hover:text-foreground"
                  : "text-primary-foreground/85 hover:text-primary-foreground",
              )}
              activeProps={{ className: "underline underline-offset-8" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden rounded-full px-5 sm:inline-flex">
            <Link to="/book">Book your stay</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "rounded-full p-2 transition-colors lg:hidden",
              solid ? "text-foreground" : "text-primary-foreground",
            )}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3 text-base text-foreground last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-4 rounded-full">
              <Link to="/book" onClick={() => setOpen(false)}>
                Book your stay
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
