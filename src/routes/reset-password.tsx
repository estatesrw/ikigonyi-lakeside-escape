import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PasswordForm } from "@/components/dashboard/PasswordForm";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset Password — Ikigonyi Round House" },
    { name: "description", content: "Securely reset your Ikigonyi Round House account password." },
    { property: "og:title", content: "Reset Password — Ikigonyi Round House" },
    { property: "og:description", content: "Securely reset your Ikigonyi Round House account password." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "invalid">("loading");
  useEffect(() => {
    let active = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") !== "recovery") { setStatus("invalid"); return; }
    supabase.auth.getUser().then(({ data, error }) => {
      if (active) setStatus(!error && data.user ? "ready" : "invalid");
    }).catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, []);
  return <main className="min-h-screen bg-background px-5 py-16">
    <div className="mx-auto max-w-lg">
      <h1 className="display text-3xl">Reset password</h1>
      {status === "loading" && <p role="status" className="mt-4 text-muted-foreground">Checking your reset link…</p>}
      {status === "ready" && <PasswordForm recovery />}
      {status === "invalid" && <p role="alert" className="mt-4 text-muted-foreground">This reset link is missing or expired. Request a new one from the sign-in page.</p>}
      <Link to="/auth" className="mt-6 inline-block text-sm text-primary">Back to sign in</Link>
    </div>
  </main>;
}