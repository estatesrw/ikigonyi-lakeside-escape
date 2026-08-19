import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFab } from "./WhatsAppFab";

export function SiteLayout({
  children,
  overlayHeader = false,
}: {
  children: ReactNode;
  overlayHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader overlay={overlayHeader} />
      <main className={overlayHeader ? "flex-1" : "flex-1 pt-24"}>{children}</main>
      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-8">
      <p className="eyebrow fade-up">{eyebrow}</p>
      <h1 className="display fade-up mt-4 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
        {title}
      </h1>
      {intro && (
        <p className="fade-up mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
      )}
    </section>
  );
}
