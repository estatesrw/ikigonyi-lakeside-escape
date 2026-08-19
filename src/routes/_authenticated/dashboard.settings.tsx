import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { useAccess } from "@/lib/dashboard";
import { useProperty } from "@/lib/property";
import { label } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fld } from "./dashboard.bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: property, isLoading } = useProperty();
  const access = useAccess();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: team } = useQuery({
    queryKey: ["team"],
    enabled: access.isOwner,
    queryFn: async () => {
      const [roles, profiles] = await Promise.all([
        supabase.from("user_roles").select("id,user_id,role"),
        supabase.from("profiles").select("id,full_name,email"),
      ]);
      if (roles.error) throw roles.error;
      if (profiles.error) throw profiles.error;
      return (roles.data ?? []).map((r) => ({
        ...r,
        profile: (profiles.data ?? []).find((p) => p.id === r.user_id),
      }));
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("properties")
        .update(form as never)
        .eq("id", property!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property updated");
      setForm({});
      qc.invalidateQueries({ queryKey: ["property"] });
      qc.invalidateQueries({ queryKey: ["dashboard-property"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !property) return <Loading />;
  const v = (k: keyof typeof property) => form[k] ?? String(property[k] ?? "");

  return (
    <div className="max-w-4xl">
      <PageTitle title="Settings" description="Property details, contact channels and team." />

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Property</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Fld label="Name">
            <Input
              value={v("name")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Fld>
          <Fld label="Tagline">
            <Input
              value={v("tagline")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Fld>
          <Fld label="Location">
            <Input
              value={v("location")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Fld>
          <Fld label="WhatsApp number">
            <Input
              value={v("whatsapp_number")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            />
          </Fld>
          <Fld label="Contact email">
            <Input
              value={v("contact_email")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </Fld>
          <Fld label="Instagram URL">
            <Input
              value={v("instagram_url")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
            />
          </Fld>
          <Fld label="Description" className="sm:col-span-2">
            <Textarea
              rows={4}
              value={v("description")}
              disabled={!access.canManage}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Fld>
          {access.canManage && (
            <div className="sm:col-span-2">
              <Button type="submit" disabled={save.isPending || Object.keys(form).length === 0}>
                Save changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {access.isOwner && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-5 pb-0">
            <h2 className="text-sm font-semibold">Team access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Roles control what each teammate can see. Only owners and managers see financials.
            </p>
          </div>
          {!team || team.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No team members" />
            </div>
          ) : (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.profile?.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.profile?.email ?? "—"}
                    </TableCell>
                    <TableCell>{label(t.role)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
