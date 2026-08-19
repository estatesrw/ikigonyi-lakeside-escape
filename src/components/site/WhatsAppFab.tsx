import { MessageCircle } from "lucide-react";
import { useProperty, whatsappLink } from "@/lib/property";

export function WhatsAppFab() {
  const { data: property } = useProperty();
  if (!property?.whatsapp_number) return null;

  return (
    <a
      href={whatsappLink(property.whatsapp_number)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.03]"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
