import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Loading, PageTitle } from "@/components/dashboard/ui";
import { useAccess, usePropertyId } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Fld } from "./dashboard.bookings";

export const Route = createFileRoute("/_authenticated/dashboard/content")({
  component: ContentPage,
});

const CATEGORIES = [
  "House",
  "Bedrooms",
  "Living Spaces",
  "Lake",
  "Outdoor",
  "Experiences",
] as const;

type MediaRow = {
  id?: string;
  category?: string;
  media_type?: string;
  image_url?: string;
  video_url?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  sort_order?: number;
  is_published?: boolean;
};

function ContentPage() {
  const { data: property } = usePropertyId();
  const access = useAccess();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [filter, setFilter] = useState<string>("All");

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
      return { content: content.data, images: (images.data ?? []) as Required<MediaRow>[] };
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

  const saveMedia = useMutation({
    mutationFn: async (row: MediaRow) => {
      const isVideo = (row.media_type ?? "image") === "video";
      if (isVideo && !row.video_url) throw new Error("A video URL is required");
      if (!isVideo && !row.image_url) throw new Error("An image URL is required");
      const payload = {
        property_id: property!.id,
        category: row.category ?? "House",
        media_type: isVideo ? "video" : "image",
        image_url: row.image_url ?? "",
        video_url: isVideo ? (row.video_url ?? null) : null,
        caption: row.caption?.trim() ? row.caption : null,
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
      toast.success("Media saved");
      setEditing(null);
      invalidateGallery();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patchMedia = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MediaRow> }) => {
      const { error } = await supabase.from("gallery_images").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateGallery(),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMedia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      invalidateGallery();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function invalidateGallery() {
    qc.invalidateQueries({ queryKey: ["content"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  async function move(list: Required<MediaRow>[], index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(target, 0, moved);
    await Promise.all(
      reordered.map((row, i) =>
        supabase.from("gallery_images").update({ sort_order: i }).eq("id", row.id),
      ),
    );
    invalidateGallery();
  }


  if (isLoading || !data) return <Loading />;

  const all = data.images;
  const visible = filter === "All" ? all : all.filter((m) => m.category === filter);

  return (
    <div>
      <PageTitle title="Content" description="Edit website copy, photography and video." />
      <Tabs defaultValue="copy">
        <TabsList>
          <TabsTrigger value="copy">Website copy</TabsTrigger>
          <TabsTrigger value="gallery">Gallery &amp; video</TabsTrigger>
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
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  filter === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {access.canManage && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEditing({
                        media_type: "video",
                        category: "House",
                        sort_order: all.length,
                        is_published: true,
                      })
                    }
                  >
                    <Video className="mr-2 size-4" /> Add video
                  </Button>
                  <Button
                    onClick={() =>
                      setEditing({
                        media_type: "image",
                        category: "House",
                        sort_order: all.length,
                        is_published: true,
                      })
                    }
                  >
                    <Plus className="mr-2 size-4" /> Add image
                  </Button>
                </>
              )}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="No media yet"
              body="Add photos or videos to publish them across the website."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((m) => {
                const index = all.findIndex((x) => x.id === m.id);
                return (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {m.media_type === "video" ? (
                      <video
                        src={m.video_url ?? undefined}
                        poster={m.image_url || undefined}
                        controls
                        preload="metadata"
                        className="aspect-[4/3] w-full bg-muted object-cover"
                      />
                    ) : (
                      <img
                        src={m.image_url}
                        alt={m.alt_text ?? ""}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    )}
                    <div className="space-y-3 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          #{index + 1} · {m.media_type === "video" ? "Video" : "Photo"}
                        </p>
                        {access.canManage && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Move earlier"
                              disabled={index === 0}
                              onClick={() => move(all, index, -1)}
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Move later"
                              disabled={index === all.length - 1}
                              onClick={() => move(all, index, 1)}
                            >
                              <ArrowDown className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <Select
                        value={m.category}
                        disabled={!access.canManage}
                        onValueChange={(value) =>
                          patchMedia.mutate({ id: m.id, patch: { category: value } })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={m.is_published}
                            disabled={!access.canManage}
                            onCheckedChange={(v) =>
                              patchMedia.mutate({ id: m.id, patch: { is_published: v } })
                            }
                          />
                          {m.is_published ? "Published" : "Hidden"}
                        </label>
                        {access.canManage && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
                              Edit
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Delete media"
                              onClick={() => removeMedia.mutate(m.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit media" : "Add media"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMedia.mutate(editing);
              }}
            >
              <Fld label="Type">
                <Select
                  value={editing.media_type ?? "image"}
                  onValueChange={(v) => setEditing({ ...editing, media_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </Fld>
              {editing.media_type === "video" && (
                <Fld label="Video URL (MP4 or WebM)">
                  <Input
                    required
                    value={editing.video_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  />
                </Fld>
              )}
              <Fld
                label={
                  editing.media_type === "video" ? "Poster image URL (optional)" : "Image URL"
                }
              >
                <Input
                  required={editing.media_type !== "video"}
                  value={editing.image_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                />
              </Fld>
              <Fld label="Category">
                <Select
                  value={editing.category ?? "House"}
                  onValueChange={(v) => setEditing({ ...editing, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Fld>
              <Fld label="Alt text">
                <Input
                  value={editing.alt_text ?? ""}
                  onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
                />
              </Fld>
              <Fld label="Caption (optional)">
                <Input
                  value={editing.caption ?? ""}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
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
                <Button type="submit" disabled={saveMedia.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
