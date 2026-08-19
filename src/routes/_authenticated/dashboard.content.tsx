import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fld } from "./dashboard.bookings";

export const Route = createFileRoute("/_authenticated/dashboard/content")({
  component: ContentPage,
});

type ImageRow = {
  id?: string;
  category?: string;
  image_url?: string;
  alt_text?: string | null;
  sort_order?: number;
  is_published?: boolean;
};

function ContentPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<ImageRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["content", property?.id],
    enabled: !!property,
    queryFn: async () => {
      const [content, images] = await Promise.all([
        supabase.from("site_content").select("*").eq("property_id", property!.id).order("key"),
        supabase
          .from("gallery_images")
          .select("*")
          .eq("property_id", property!.id)
          .order("sort_order"),
      ]);
      if (content.error) throw content.error;
      if (images.error) throw images.error;
      return { content: content.data, images: images.data as unknown as Required<ImageRow>[] };
    },
  });

  const saveText = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase.from("site_content").update({ value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Content updated");
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveImage = useMutation({
    mutationFn: async (row: ImageRow) => {
      const payload = {
        property_id: property!.id,
        category: row.category ?? "general",
        image_url: row.image_url ?? "",
        alt_text: row.alt_text ?? null,
        sort_order: Number(row.sort_order ?? 0),
        is_published: row.is_published ?? true,
      };
      const { error } = row.id
        ? await supabase.from("gallery_images").update(payload).eq("id", row.id)
        : await supabase.from("gallery_images").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image removed");
      qc.invalidateQueries({ queryKey: ["content"] });
    },
  });

  if (isLoading || !data) return <Loading />;

  return (
    <div>
      <PageTitle title="Content" description="Edit website copy and gallery imagery." />
      <Tabs defaultValue="copy">
        <TabsList>
          <TabsTrigger value="copy">Website copy</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="copy" className="mt-4 space-y-3">
          {data.content.length === 0 && <EmptyState title="No content keys" />}
          {data.content.map((row) => {
            const value = drafts[row.id] ?? row.value ?? "";
            return (
              <div key={row.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{row.key}</p>
                <Textarea
                  className="mt-2"
                  rows={value.length > 120 ? 4 : 2}
                  value={value}
                  disabled={!access.canManage}
                  onChange={(e) => setDrafts({ ...drafts, [row.id]: e.target.value })}
                />
                {access.canManage && value !== (row.value ?? "") && (
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => saveText.mutate({ id: row.id, value })}
                  >
                    Save
                  </Button>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          {access.canManage && (
            <Button
              className="mb-4"
              onClick={() =>
                setEditing({ category: "general", sort_order: data.images.length, is_published: true })
              }
            >
              <Plus className="mr-2 size-4" /> Add image
            </Button>
          )}
          {data.images.length === 0 ? (
            <EmptyState title="No gallery images" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.images.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-xl border border-border bg-card">
                  <img
                    src={img.image_url}
                    alt={img.alt_text ?? ""}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">
                      {img.category} · {img.is_published ? "Published" : "Hidden"}
                    </p>
                    {access.canManage && (
                      <div className="mt-2 flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(img)}>
                          Edit
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete image"
                          onClick={() => removeImage.mutate(img.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit image" : "Add image"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveImage.mutate(editing);
              }}
            >
              <Fld label="Image URL">
                <Input
                  required
                  value={editing.image_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                />
              </Fld>
              <Fld label="Category">
                <Input
                  value={editing.category ?? ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </Fld>
              <Fld label="Alt text">
                <Input
                  value={editing.alt_text ?? ""}
                  onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
                />
              </Fld>
              <Fld label="Sort order">
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </Fld>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editing.is_published ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
                />
                <span className="text-sm">Published on the website</span>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saveImage.isPending}>
                  Save image
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
