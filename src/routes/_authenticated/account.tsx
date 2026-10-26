import { createFileRoute, Link } from "@tanstack/react-router";
import { PasswordForm } from "@/components/dashboard/PasswordForm";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "Account Security — Ikigonyi Round House" },
    { name: "description", content: "Manage your Ikigonyi Round House account password." },
    { property: "og:title", content: "Account Security — Ikigonyi Round House" },
    { property: "og:description", content: "Manage your Ikigonyi Round House account password." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AccountPage,
});

function AccountPage() {
  return <main className="min-h-screen bg-background px-5 py-16">
    <div className="mx-auto max-w-lg">
      <Link to="/dashboard" className="text-sm text-muted-foreground">← Dashboard</Link>
      <h1 className="display mt-6 text-3xl">Account security</h1>
      <PasswordForm />
    </div>
  </main>;
}