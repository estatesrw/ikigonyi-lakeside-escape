import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validatePasswordChange } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm({ recovery = false }: { recovery?: boolean }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    const validation = validatePasswordChange(password, confirmation);
    if (validation) { setError(validation); return; }
    setPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser(
        recovery ? { password } : { password, current_password: current },
      );
      if (updateError) throw updateError;
      setCurrent(""); setPassword(""); setConfirmation(""); setSuccess(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update your password. Please try again.");
    } finally { setPending(false); }
  }

  return (
    <form className="mt-6 max-w-md space-y-4" onSubmit={submit}>
      {!recovery && <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input id="current-password" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>}
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && <p role="status" className="text-sm text-foreground">Your password has been changed.</p>}
      <Button type="submit" disabled={pending}>{pending ? "Updating…" : "Change password"}</Button>
    </form>
  );
}