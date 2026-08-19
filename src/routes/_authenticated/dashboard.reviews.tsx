import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fld } from "./dashboard.bookings";

export const Route = createFileRoute("/_authenticated/dashboard/reviews")({
  component: ReviewsPage,
});

type Review = {
  id?: string;
  author_name?: string;
  author_location?: string | null;
  rating?: number;
  body?: string;
  stay_date?: string | null;
  is_published?: boolean;
  sort_order?: number;
};

function ReviewsPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Review | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews-admin", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("property_id", property!.id)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Required<Review>[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Review) => {
      const payload = {
        property_id: property!.id,
        author_name: row.author_name ?? "",
        author_location: row.author_location ?? null,
        rating: Number(row.rating ?? 5),
        body: row.body ?? "",
        stay_date: row.stay_date || null,
        is_published: row.is_published ?? true,
        sort_order: Number(row.sort_order ?? 0),
      };
      const { error } = row.id
        ? await supabase.from("reviews").update(payload).eq("id", row.id)
        : await supabase.from("reviews").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["reviews-admin"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loading />;
  const rows = data ?? [];

  return (
    <div>
      <PageTitle
        title="Reviews"
        description="Guest testimonials shown on the website."
        action={
          access.canManage && (
            <Button onClick={() => setEditing({ rating: 5, is_published: true, sort_order: rows.length })}>
              <Plus className="mr-2 size-4" /> Add review
            </Button>
          )
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {r.is_published ? "Published" : "Hidden"}
                </span>
              </div>
              <p className="mt-3 text-sm">{r.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {r.author_name}
                {r.author_location ? ` · ${r.author_location}` : ""}
                {r.stay_date ? ` · ${r.stay_date}` : ""}
              </p>
              {access.canManage && (
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setEditing(r)}>
                  Edit
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit review" : "Add review"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              <Fld label="Author">
                <Input
                  required
                  value={editing.author_name ?? ""}
                  onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                />
              </Fld>
              <Fld label="Location">
                <Input
                  value={editing.author_location ?? ""}
                  onChange={(e) => setEditing({ ...editing, author_location: e.target.value })}
                />
              </Fld>
              <Fld label="Rating (1-5)">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editing.rating ?? 5}
                  onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                />
              </Fld>
              <Fld label="Review">
                <Textarea
                  rows={4}
                  required
                  value={editing.body ?? ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </Fld>
              <Fld label="Stay date">
                <Input
                  type="date"
                  value={editing.stay_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, stay_date: e.target.value })}
                />
              </Fld>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editing.is_published ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
                />
                <span className="text-sm">Published</span>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>
                  Save review
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
